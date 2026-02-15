import os

class AIConfig:
    # Model Configuration Optimized by Task Complexity
    SIMPLE_MODEL = "gemini-flash-lite-latest"   # Lightweight, cost-effective for simple extraction
    COMPLEX_MODEL = "gemini-3-flash-preview"  # Advanced reasoning for variant discovery and metadata
    
    # Default model for backward compatibility
    MODEL_NAME = COMPLEX_MODEL

    # Generation Configs

    # Generation Configs
    JSON_GENERATION_CONFIG = {
        "temperature": 0.1,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 8192,
        "response_mime_type": "application/json",
    }
    
    TEXT_GENERATION_CONFIG = {
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 8192,
    }

    LOCATION = os.environ.get("GOOGLE_CLOUD_LOCATION", "europe-west1")
    PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT")
