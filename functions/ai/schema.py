from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field


# --- Pydantic Models for Structured Output ---
class ProductVariant(BaseModel):
    sku_suffix: str
    variant_name: str
    option_name: str
    option_value: str
    pylon_sku: Optional[str] = None

class ProductImage(BaseModel):
    url: str
    description: Optional[str] = None

class PaintTechnicalSpecs(BaseModel):
    surface_suitability: List[Literal["Wood", "Metal", "Concrete", "Plaster", "Drywall", "Plastic", "Glass", "Multisurface"]] = Field(description="List of suitable surfaces")
    finish: Literal["Matte", "Satin", "Gloss", "Eggshell", "Semi-gloss", "High-gloss", "Metallic", "Textured"] = Field(description="Finish type")
    application: List[Literal["Brush", "Roller", "Spray", "Sponge"]] = Field(description="Application methods")
    coverage: str = Field(description="Coverage area per liter or unit (e.g., 10-12m²/L)")
    drying_time: str = Field(description="Drying time (e.g., 1-2 hours)")
    durability_features: List[str] = Field(description="Durability features (e.g., Rust-proof, Washable, UV-resistant)")
    environment: Literal["Indoor", "Outdoor", "Both"] = Field(description="Recommended environment")

class ProductEnrichmentData(BaseModel):
    title_el: str = Field(description="Customer-friendly product title in Greek")
    description_el: str = Field(description="SEO-optimized product description in Greek")
    description: str = Field(description="Product description in English")
    short_description: str = Field(description="Brief summary for collections")
    tags: List[str] = Field(description="List of relevant tags")
    category: str = Field(description="Main product category")
    variants: List[ProductVariant] = Field(description="Discovered product variants", default=[])
    attributes: Dict[str, Any] = Field(description="Key-value product attributes", default={})
    technical_specs: Optional[PaintTechnicalSpecs] = Field(description="Technical specifications for paint products", default=None)
    confidence_score: float = Field(description="Confidence score 0.0-1.0")
