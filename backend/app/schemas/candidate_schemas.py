"""
Skemat Pydantic për modulin e kandidatit.
  - Input schemas  (Create/Update) — validojnë të dhënat hyrëse nga frontend-i
  - Response schemas (Read)        — strukturojnë të dhënat dalëse nga API-ja
"""
from pydantic import BaseModel
from typing import Optional


# ─── INPUT SCHEMAS ────────────────────────────────────────────────────────────

class ApplicationCreate(BaseModel):
    job_id: int
    cv_file_id: Optional[int] = None


class CandidateProfileUpdate(BaseModel):
    headline: Optional[str] = None
    summary: Optional[str] = None
    skills: Optional[str] = None
    experience_level: Optional[str] = None
    education: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    desired_role: Optional[str] = None
    expected_salary: Optional[str] = None


# ─── RESPONSE SCHEMAS ─────────────────────────────────────────────────────────

class JobOut(BaseModel):
    id: int
    title: str
    description: str
    location: Optional[str] = None
    job_type: Optional[str] = None
    salary: Optional[float] = None
    company_name: str
    match_score: int
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
    match_score: int
