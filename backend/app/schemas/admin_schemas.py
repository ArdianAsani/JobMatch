# Skemat Pydantic për përgjigjet e endpoint-eve të adminit
# Këto skema sigurojnë që API-ja kthen gjithmonë strukturën e saktë të të dhënave
from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


class AdminStatsResponse(BaseModel):
    """Statistikat e panelit të adminit — numërime të përgjithshme të sistemit."""
    total_users: int
    total_candidates: int
    total_companies: int
    pending_companies: int      # Kompani që presin miratim (aktive, pa miratim)
    approved_companies: int
    active_jobs: int
    inactive_jobs: int
    total_jobs: int
    total_applications: int
    applications_by_status: dict  # Numërim sipas statusit: Pending, Accepted, etj.


class AdminUserRow(BaseModel):
    """Të dhënat e një user-i në listën e adminit."""
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ToggleUserActiveResponse(BaseModel):
    """Përgjigja pas aktivizimit/deaktivizimit të një user-i."""
    id: int
    name: str
    email: str
    is_active: bool
    message: str


class AdminCompanyRow(BaseModel):
    """Të dhënat e një kompanie në listën e adminit — përfshin edhe email-in e user-it."""
    company_profile_id: int
    user_id: int
    company_name: str
    email: str
    industry: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    is_approved: bool
    created_at: datetime


class ApproveCompanyResponse(BaseModel):
    """Përgjigja pas miratimit të një kompanie nga admini."""
    company_profile_id: int
    company_name: str
    is_approved: bool
    message: str


class RejectCompanyResponse(BaseModel):
    """
    Përgjigja pas refuzimit të një kompanie.
    user_deactivated=True konfirmon që llogaria e user-it u bë joaktive.
    Profili i kompanisë ruhet për auditim.
    """
    company_profile_id: int
    company_name: str
    user_deactivated: bool
    message: str


class AdminJobRow(BaseModel):
    """Të dhënat e një shpalljeje pune në panelin e adminit — me numërin e aplikimeve."""
    id: int
    title: str
    company_name: str
    company_id: int
    location: Optional[str] = None
    job_type: Optional[str] = None
    salary: Optional[float] = None
    is_active: bool
    deadline: Optional[date] = None
    created_at: datetime
    applicants_count: int


class ToggleJobActiveResponse(BaseModel):
    """Përgjigja pas aktivizimit/deaktivizimit të një shpalljeje pune."""
    id: int
    title: str
    is_active: bool
    message: str


class AdminApplicationRow(BaseModel):
    """Të dhënat e një aplikimi në panelin e adminit — me emrin e kandidatit dhe kompanisë."""
    id: int
    candidate_name: str
    candidate_email: str
    job_title: str
    company_name: str
    status: str
    applied_at: datetime
    updated_at: Optional[datetime] = None
