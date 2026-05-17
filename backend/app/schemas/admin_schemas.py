from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


class AdminStatsResponse(BaseModel):
    total_users: int
    total_candidates: int
    total_companies: int
    pending_companies: int
    approved_companies: int
    active_jobs: int
    inactive_jobs: int
    total_jobs: int
    total_applications: int
    applications_by_status: dict


class AdminUserRow(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ToggleUserActiveResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    is_active: bool
    message: str


class AdminCompanyRow(BaseModel):
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
    company_profile_id: int
    company_name: str
    is_approved: bool
    message: str


class RejectCompanyResponse(BaseModel):
    company_profile_id: int
    company_name: str
    user_deactivated: bool
    message: str


class AdminJobRow(BaseModel):
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
    id: int
    title: str
    is_active: bool
    message: str


class AdminApplicationRow(BaseModel):
    id: int
    candidate_name: str
    candidate_email: str
    job_title: str
    company_name: str
    status: str
    applied_at: datetime
    updated_at: Optional[datetime] = None
