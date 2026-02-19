import os
from enum import Enum

class ModelName(Enum):
    SIMPLE = "gemini-2.5-flash-lite"
    COMPLEX = "gemini-2.5-flash-lite" # Updated to correct Vertex AI ID (2.5)
    IMAGE_GEN = "gemini-2.5-flash-image"
    IMAGE_RECONTEXT = "imagen-product-recontext-preview-06-30"
    EMBEDDING = "text-embedding-004"

class LLMConfig:
    # Explicitly use pavlicevits-9a889 to override any environment mismatch
    PROJECT_ID = "pavlicevits-9a889"
    REGION = os.getenv("GCP_REGION", "europe-west1")

    # GCS Configuration for Batch Processing
    BATCH_INPUT_GCS_PATH = f"gs://{PROJECT_ID}-batch-inputs"
    BATCH_OUTPUT_GCS_PATH = f"gs://{PROJECT_ID}-batch-outputs"

    @classmethod
    def get_model_name(cls, complex: bool = True) -> str:
        return ModelName.COMPLEX.value if complex else ModelName.SIMPLE.value

    @classmethod
    def get_image_model_name(cls, model_type: str = "gemini") -> str:
        if model_type == "imagen":
            return ModelName.IMAGE_RECONTEXT.value
        return ModelName.IMAGE_GEN.value

    @classmethod
    def get_client(cls):
        """Returns a google-genai Client configured for Vertex AI."""
        from google import genai
        return genai.Client(
            vertexai=True,
            project=cls.PROJECT_ID,
            location=cls.REGION
        )
