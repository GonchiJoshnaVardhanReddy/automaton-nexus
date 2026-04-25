"""
Community Skills - Pydantic Models
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class SkillVisibility(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"


class CommunitySkillBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: str = Field(..., min_length=5, max_length=500)
    markdown_content: str = Field(..., min_length=10)
    tags: List[str] = []
    languages: List[str] = []
    visibility: SkillVisibility = SkillVisibility.PUBLIC
    category: str = "starter"  # "starter" | "advanced"


class CommunitySkillCreate(CommunitySkillBase):
    pass


class CommunitySkillUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    markdown_content: Optional[str] = None
    tags: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    visibility: Optional[SkillVisibility] = None


class CommunitySkillResponse(CommunitySkillBase):
    id: str
    author_id: str
    author_name: str
    usage_count: int = 0
    clone_count: int = 0
    is_official: bool = False
    created_at: datetime
    updated_at: datetime
    is_owner: bool = False


class GenerateAgentFromSkillRequest(BaseModel):
    skill_id: str
    edited_markdown: str
    agent_name: str
    voice: str = "professional_female"
