"""
Skemat Pydantic për modulin e kandidatit.
  - Input schemas  (Create/Update) — validojnë të dhënat hyrëse nga frontend-i
  - Response schemas (Read)        — strukturojnë të dhënat dalëse nga API-ja
"""
from pydantic import BaseModel, field_validator
from typing import Optional


# ─── INPUT SCHEMAS ────────────────────────────────────────────────────────────

class ApplicationCreate(BaseModel):
    job_id: int
    cv_file_id: Optional[int] = None


class CandidateProfileUpdate(BaseModel):
    headline: Optional[str] = None
    professional_summary: Optional[str] = None
    skills: Optional[str] = None
    experience_level: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None

    @field_validator('professional_summary')
    @classmethod
    def summary_min_length(cls, v):
        if v is not None and v.strip() and len(v.strip()) < 30:
            raise ValueError('Professional summary must be at least 30 characters')
        return v

    @field_validator('skills')
    @classmethod
    def skills_min_length(cls, v):
        if v is not None and v.strip() and len(v.strip()) < 5:
            raise ValueError('Skills must be at least 5 characters')
        return v


# ─── RESPONSE SCHEMAS ─────────────────────────────────────────────────────────

class JobOut(BaseModel):
    id: int
    title: str
    description: str
    requirements: Optional[str] = None
    skills_required: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    salary: Optional[float] = None
    company_name: str
    applicant_count: int
    posted_ago: str
    is_saved: bool

    model_config = {"from_attributes": True}


class MyApplicationOut(BaseModel):
    app_id: int
    status: str
    job_title: str
    company_name: str
    applied_at_formatted: str
