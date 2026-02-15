"""Comprehensive status check - output to JSON."""
from google import genai
from google.cloud import storage
import json

results = {}

# 1. Check Vertex AI job status
client = genai.Client(vertexai=True, project="pavlicevits-9a889", location="europe-west1")
job = client.batches.get(name="projects/879284048895/locations/europe-west1/batchPredictionJobs/1249988796288598016")
results["current_job"] = {
    "state": str(job.state),
    "created": str(job.create_time),
    "updated": str(job.update_time),
    "error": str(getattr(job, 'error', None)),
}

# 2. List ALL output blobs
storage_client = storage.Client()
bucket = storage_client.bucket("pavlicevits-9a889-batch-outputs")
all_blobs = list(bucket.list_blobs())
results["output_bucket_blobs"] = [
    {"name": b.name, "size": b.size, "updated": str(b.updated)}
    for b in all_blobs[:30]
]

# 3. All jobs
all_jobs = list(client.batches.list())
results["all_jobs"] = [
    {"id": j.name.split("/")[-1], "state": str(j.state), "created": str(getattr(j, 'create_time', ''))}
    for j in all_jobs
]

with open("batch_status.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("Done - see batch_status.json")
