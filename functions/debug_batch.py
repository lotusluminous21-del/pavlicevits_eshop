
import os
import sys
from firebase_admin import firestore, initialize_app
import traceback

# Add parent directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from core.llm_config import LLMConfig

def debug_and_fix_aggressive():
    try:
        initialize_app()
        db = firestore.client()
        client = LLMConfig.get_client()
        
        active_batches = db.collection("enrichment_batches").where("status", "==", "RUNNING").get()
        print(f"Found {len(active_batches)} active batches in Firestore.")
        
        # Get all recent jobs from Gemini to cross-reference
        all_gemini_jobs = list(client.batches.list())
        print(f"Found {len(all_gemini_jobs)} jobs in Gemini API.")

        for batch_doc in active_batches:
            data = batch_doc.to_dict()
            batch_id = batch_doc.id
            stored_job_id = data.get('job_id')
            output_path = data.get('output_path')
            
            print(f"\nAnalyzing Batch Doc: {batch_id}")
            print(f"  Stored Job ID: {stored_job_id}")
            print(f"  Expected Output: {output_path}")
            
            # Find the actual job in Gemini by matching the destination path
            actual_job = None
            for job in all_gemini_jobs:
                # Use string representation of job to find destination if config access is tricky
                job_str = str(job)
                if output_path in job_str:
                    actual_job = job
                    break
            
            if not actual_job:
                # Fallback: try to get by ID if possible
                try:
                    actual_job = client.batches.get(name=stored_job_id)
                except:
                    pass
            
            if actual_job:
                print(f"  Found Gemini Match: {actual_job.name}")
                print(f"  Gemini State: {actual_job.state}")
                
                # If IDs mismatch, fix it in Firestore
                if actual_job.name != stored_job_id:
                    print(f"  FIXING JOB ID: {stored_job_id} -> {actual_job.name}")
                    batch_doc.reference.update({"job_id": actual_job.name})
                
                # Now run the real poller logic
                from ai.enrichment import process_completed_batches
                print("  Running process_completed_batches()...")
                process_completed_batches()
                print("  Done.")
            else:
                print("  CRITICAL: Could not find any matching Gemini job for this batch.")

    except Exception as e:
        print(f"\nERROR: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    debug_and_fix_aggressive()
