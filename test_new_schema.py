import asyncio
import os
import json
from pprint import pprint

# Set mock env vars
os.environ["GEMINI_API_KEY"] = "mock"

# Mock the entire LLM call to just test Pydantic validation
from functions.ai.schema import ProductEnrichmentData

def test_schema_validation():
    print("Testing Schema Validation with Mock AI Response...")
    
    mock_json_response = {
        "title": "HB BODY 951 Αυτοκινήτου Ακρυλικό",
        "description": "Το HB BODY 951 είναι ένα εξαιρετικό ακρυλικό χρώμα...",
        "short_description": "Ακρυλικό χρώμα αυτοκινήτου",
        "tags": ["χρώμα", "ακρυλικό", "αυτοκίνητο"],
        "category": "Σπρέι Βαφής",
        "variants": [
            {
                "sku_suffix": "-RED",
                "variant_name": "Κόκκινο 400ml",
                "option1_name": "Χρώμα",
                "option1_value": "Κόκκινο",
                "option2_name": "Όγκος / Συσκευασία",
                "option2_value": "400ml"
            },
            {
                "sku_suffix": "-BLK",
                "variant_name": "Μαύρο 400ml",
                "option1_name": "Χρώμα",
                "option1_value": "Μαύρο",
                "option2_name": "Όγκος / Συσκευασία",
                "option2_value": "400ml"
            }
        ],
        "attributes": {"brand": "HB Body"},
        "technical_specs": {
            "chemical_base": "Ακρυλικό",
            "sequence_step": "Βασικό Χρώμα",
            "surface_suitability": ["Γυμνό Μέταλλο", "Πλαστικό"],
            "finish": "Γυαλιστερό",
            "special_properties": ["Ανθεκτικό σε UV", "1 Συστατικού"],
            "drying_time_touch": "10 λεπτά",
            "recoat_window": "1 ώρα",
            "application_method": ["Σπρέι", "Πιστόλι Βαφής"]
        },
        "confidence_score": 0.95
    }
    
    try:
        validated_data = ProductEnrichmentData(**mock_json_response)
        print("[OK] Schema validation successful!")
        pprint(validated_data.dict())
    except Exception as e:
        print("[FAIL] Schema validation failed:")
        print(e)

if __name__ == "__main__":
    test_schema_validation()
