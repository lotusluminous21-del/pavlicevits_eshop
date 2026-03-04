# functions/expert_v2/schema.py
# Owns: Data contracts only. No logic, no LLM calls.

from __future__ import annotations
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class QuestionOption(BaseModel):
    id: str
    label: str
    value: Any
    description: Optional[str] = None
    icon: Optional[str] = None


class ExpertQuestion(BaseModel):
    id: str
    text: str
    type: str = "multiple-choice"  # "multiple-choice" | "text"
    options: Optional[List[QuestionOption]] = None
    help_text: Optional[str] = None


class SolutionStep(BaseModel):
    order: int
    title: str
    description: str
    tips: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    product_handles: List[str] = Field(default_factory=list)
    selected_products: List[Dict[str, Any]] = Field(default_factory=list)


class Solution(BaseModel):
    id: str
    title: str
    project_type: str
    difficulty: str  # "beginner" | "intermediate" | "advanced"
    estimated_time: str
    steps: List[SolutionStep]
    total_price: float = 0.0
    total_products: int = 0
    assumptions: List[str] = Field(default_factory=list)


class KnowledgeState(BaseModel):
    domain: str = "unknown"
    project_type: str = "unknown"
    confirmed_facts: Dict[str, Any] = Field(default_factory=dict)
    inferred_facts: Dict[str, Any] = Field(default_factory=dict)
    gaps: Dict[str, List[str]] = Field(default_factory=lambda: {
        "critical": [], "important": [], "optional": []
    })
    last_asked_id: Optional[str] = None  # tracks which question was asked last turn


class ExpertChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = Field(default_factory=list)
    state: Dict[str, Any] = Field(default_factory=dict)
    image_url: Optional[str] = None


class ExpertChatResponse(BaseModel):
    answer: str
    question: Optional[ExpertQuestion] = None
    solution: Optional[Solution] = None
    ready_for_solution: bool = False
    suggested_products: List[Dict[str, Any]] = Field(default_factory=list)
    safety_warnings: List[str] = Field(default_factory=list)
    state: Dict[str, Any] = Field(default_factory=dict)
