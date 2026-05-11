from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db
from app.models import JobListing, Application, CandidateProfile, CompanyProfile, File

router = APIRouter(prefix="/api/dashboard", tags=["Dashboards"])

# --- SCHEMAS ---
class JobCreate(BaseModel):
    company_id: int
    title: str
    description: str
    location: str = "Prishtina"
    job_type: str = "Full-time"

class ApplicationCreate(BaseModel):
    candidate_id: int
    job_id: int
    cv_file_id: int

# --- ROUTES ---

@router.get("/jobs/all")
def get_all_jobs(db: Session = Depends(get_db)):
    return db.query(JobListing).all()

@router.get("/company/{user_id}")
def get_company_listings(user_id: int, db: Session = Depends(get_db)):
    company = db.query(CompanyProfile).filter(CompanyProfile.user_id == user_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")
    listings = db.query(JobListing).filter(JobListing.company_id == company.id).all()
    # Kthejmë edhe info të kompanisë për sidebar
    return {
        "my_listings": listings,
        "company_info": {
            "name": company.company_name,
            "industry": company.industry,
            "location": "Prishtina, Kosovë" # Mund ta marrësh nga DB
        }
    }

@router.post("/jobs/create")
def create_job(job_in: JobCreate, db: Session = Depends(get_db)):
    new_job = JobListing(company_id=job_in.company_id, title=job_in.title, 
                         description=job_in.description, location=job_in.location, job_type=job_in.job_type)
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

@router.post("/applications/create")
def create_application(app_in: ApplicationCreate, db: Session = Depends(get_db)):
    new_app = Application(candidate_id=app_in.candidate_id, job_id=app_in.job_id, 
                          cv_file_id=app_in.cv_file_id, status="Pending")
    db.add(new_app)
    db.commit()
    return {"message": "Success"}

@router.get("/company/{user_id}/applicants")
def get_company_applicants(user_id: int, db: Session = Depends(get_db)):
    company = db.query(CompanyProfile).filter(CompanyProfile.user_id == user_id).first()
    results = db.query(
        Application.id.label("app_id"),
        JobListing.title.label("job_title"),
        CandidateProfile.headline.label("candidate_name"),
        CandidateProfile.summary.label("candidate_summary"),
        CandidateProfile.skills.label("candidate_skills")
    ).join(JobListing, Application.job_id == JobListing.id) \
     .join(CandidateProfile, Application.candidate_id == CandidateProfile.id) \
     .filter(JobListing.company_id == company.id).all()
    return [dict(row._mapping) for row in results]