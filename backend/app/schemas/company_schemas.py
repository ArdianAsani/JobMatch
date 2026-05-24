"""
Skemat Pydantic për modulin e kompanisë.
  - Input schemas  (Create / Update) — validojnë të dhënat hyrëse nga frontend-i
  - Response schemas (Read)          — strukturojnë të dhënat dalëse nga API-ja
"""
from pydantic import BaseModel, field_validator
from typing import Optional, List


# ─── INPUT SCHEMAS ────────────────────────────────────────────────────────────

class JobCreate(BaseModel):
    """Fushat e nevojshme për krijimin e një shpalljeje të re pune."""
    title: str
    description: str
    location: str = "Prishtina"
    job_type: str = "Full-time"   # Full-time | Part-time | Remote | Contract
    salary: Optional[float] = None
    requirements: Optional[str] = None
    skills_required: Optional[str] = None
    deadline: Optional[str] = None        # Format ISO: YYYY-MM-DD

    @field_validator('description')
    @classmethod
    def description_min_length(cls, v):
        if len(v.strip()) < 50:
            raise ValueError('Job description must be at least 50 characters')
        return v


class JobUpdate(BaseModel):
    """Modifikim i pjesshëm i shpalljes — çdo fushë është opsionale (PATCH-style)."""
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    salary: Optional[float] = None
    requirements: Optional[str] = None
    skills_required: Optional[str] = None
    deadline: Optional[str] = None

    @field_validator('description')
    @classmethod
    def description_min_length(cls, v):
        if v is not None and v.strip() and len(v.strip()) < 50:
            raise ValueError('Job description must be at least 50 characters')
        return v


class CompanyProfileUpdate(BaseModel):
    """Modifikim i profilit të kompanisë — çdo fushë është opsionale."""
    company_name: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    company_size: Optional[str] = None    # p.sh. "200-500 employees"
    founded_year: Optional[str] = None   # p.sh. "2018"
    hq_location: Optional[str] = None


class ApplicationStatusUpdate(BaseModel):
    """Ndryshimi i statusit të aplikimit nga kompania."""
    status: str   # Pending | Under Review | Interview | Accepted | Rejected


# ─── RESPONSE SCHEMAS ─────────────────────────────────────────────────────────

class JobListingOut(BaseModel):
    """Shpallja e punës e pasuruar me numrin e aplikimeve dhe kohën relative."""
    id: int
    title: str
    description: str
    location: Optional[str] = None
    job_type: Optional[str] = None
    salary: Optional[float] = None
    requirements: Optional[str] = None
    skills_required: Optional[str] = None
    deadline: Optional[str] = None
    is_active: bool
    posted_ago: str
    applicant_count: int

    model_config = {"from_attributes": True}


class CompanyInfoOut(BaseModel):
    """Profili i kompanisë i kthyer nga dashboard."""
    id: int
    name: str
    industry: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    company_size: Optional[str] = None
    founded_year: Optional[str] = None
    hq_location: Optional[str] = None
    is_approved: bool


class WeeklyPoint(BaseModel):
    """Një pikë e dhënash në grafikun javor të aplikimeve."""
    day: str
    count: int


class StatsOut(BaseModel):
    """Statistikat e panelit të kompanisë."""
    total_applicants: int
    new_today: int
    active_listings: int
    by_status: dict            # { "Pending": 12, "Accepted": 5, ... }
    weekly: List[WeeklyPoint]


class ApplicantOut(BaseModel):
    """Aplikuesi i shfaqur në listën e kompanisë."""
    app_id: int
    app_status: str
    job_title: str
    candidate_name: str
    candidate_headline: Optional[str] = None
    candidate_summary: Optional[str] = None
    candidate_skills: Optional[str] = None
    applied_at_formatted: str
