import json
from typing import List, Dict, Any
from google import genai
from google.genai import types as genai_types
from core.logger import get_logger
from core.llm_config import LLMConfig

logger = get_logger("expert_v3.solution_builder")

def generate_expert_solution(
    history_text: str,
    accumulated_products: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate a final structured project plan from chat history and gathered products 
    without relying on an agent loop.
    """
    model_name = LLMConfig.get_model_name(complex=True)
    vertex_client = LLMConfig.get_client()

    products_json = json.dumps(accumulated_products, ensure_ascii=False)

    system_prompt = f"""Είσαι ο υπεύθυνος ενός κορυφαίου καταστήματος χρωμάτων (Pavlicevits).
Ο πελάτης είναι έτοιμος να προχωρήσει με τη λύση που συζητήσατε.
ΠΡΕΠΕΙ να επιστρέψεις ΕΝΑ ΕΓΚΥΡΟ JSON object με την παρακάτω δομή, 
το οποίο αντιπροσωπεύει το τελικό πλάνο του πελάτη.

ΑΠΑΓΟΡΕΥΕΤΑΙ ΡΗΤΑ ΟΠΟΙΟΔΗΠΟΤΕ ΑΛΛΟ ΚΕΙΜΕΝΟ ΕΚΤΟΣ ΑΠΟ ΤΟ JSON.

Διαθέσιμα Προϊόντα (accumulatedProducts):
{products_json}

Ζωτικό: Χρησιμοποίησε ΑΚΡΙΒΩΣ τα variant_id και handle από τα παραπάνω αντικείμενα. 

CUSTOM PAINT PRODUCTS: Τα προϊόντα με handle "custom-spray-paint", "custom-bucket-paint" ή "custom-touchup-kit"
είναι εξατομικευμένα. Αν τα συμπεριλάβεις σε ένα βήμα, πρόσθεσε στο αντικείμενο selected_products τα πεδία:
  "is_custom_paint": true,
  "custom_color_info": {{
    "color_system": "<RAL/NCS/Pantone/OEM/description — εξαγόμενο από τη συνομιλία>",
    "color_code": "<ο κωδικός ή η περιγραφή χρώματος — εξαγόμενη από τη συνομιλία>",
    "notes": "<τυχόν σημειώσεις σχετικά με τη μάρκα αυτοκινήτου, ακρίβεια, κτλ.>"
  }}
Εξέτασε ΟΛΟΚΛΗΡΗ τη συνομιλία για να βρεις τις πληροφορίες χρώματος.

Η ΔΟΜΗ ΤΟΥ JSON:
{{
  "solution": {{
    "title": "Προτεινόμενη Λύση",
    "project_type": "Custom Customization",
    "difficulty": "beginner/intermediate/advanced",
    "estimated_time": "2-4 hours",
    "steps": [
      {{
        "order": 1,
        "title": "Βήμα 1...",
        "description": "Λεπτομερείς οδηγίες στα Ελληνικά",
        "tips": ["Συμβουλή 1"],
        "warnings": ["Προσοχή 1"],
        "selected_products": [
          {{
            "variant_id": "gid://shopify/ProductVariant/...",
            "variant_title": "Ονομασία παραλλαγής",
            "product_title": "Κύριος τίτλος προϊόντος",
            "handle": "το-στρινγκ-του-handle",
            "is_custom_paint": false,
            "custom_color_info": null
          }}
        ]
      }}
    ],
    "all_product_handles": []
  }}
}}
"""

    try:
        response = vertex_client.models.generate_content(
            model=model_name,
            contents=[
                genai_types.Content(
                    role="user",
                    parts=[genai_types.Part.from_text(text=history_text)]
                )
            ],
            config=genai_types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
            ),
        )

        output_text = response.text
        if not output_text:
            raise ValueError("Empty response from LLM")
            
        parsed_json = json.loads(output_text)
        
        # Ensure it's wrapped in a status success envelope 
        # so the frontend (and existing logic) can parse it.
        return {
            "status": "success",
            "solution": parsed_json.get("solution", {})
        }

    except Exception as e:
        logger.error("Failed to build solution", exc_info=True)
        return {
            "status": "error",
            "answer": "Παρουσιάστηκε σφάλμα κατά τη δημιουργία της λύσης."
        }
