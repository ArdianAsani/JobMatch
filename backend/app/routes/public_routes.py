"""
Router publik — endpoint-e pa autentikim.

Prefix:  /api/jobs
Tag:     Public Jobs

Endpoint-et:
  GET /public — kthen të gjitha shpalljet aktive me emrin e kompanisë
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models import JobListing, CompanyProfile
from app.routes.company_routes import _time_ago

router = APIRouter(prefix="/api/jobs", tags=["Public Jobs"])


class PublicJobOut(BaseModel):
    id: int
    title: str
    description: str
    requirements: Optional[str] = None
    skills_required: Optional[str] = None
    job_type: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[float] = None
    company_name: str
    company_id: int
    posted_ago: str

    model_config = {"from_attributes": True}


@router.get("/public", response_model=list[PublicJobOut])
def get_public_jobs(db: Session = Depends(get_db)):
    """Kthen të gjitha shpalljet aktive — i aksesueshëm pa JWT."""
    rows = (
        db.query(
            JobListing.id,
            JobListing.title,
            JobListing.description,
            JobListing.requirements,
            JobListing.skills_required,
            JobListing.job_type,
            JobListing.location,
            JobListing.salary,
            JobListing.company_id,
            JobListing.created_at,
            CompanyProfile.company_name.label("company_name"),
        )
        .join(CompanyProfile, JobListing.company_id == CompanyProfile.id)
        .filter(JobListing.is_active == True)
        .order_by(JobListing.created_at.desc())
        .all()
    )

    out = []
    for row in rows:
        d = dict(row._mapping)
        d["posted_ago"] = _time_ago(d.pop("created_at", None))
        if d["salary"] is not None:
            d["salary"] = float(d["salary"])
        out.append(d)
    return out
