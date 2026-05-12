from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.database import get_db
from app.models import JobListing, Application, CandidateProfile, CompanyProfile

router = APIRouter(prefix="/api/dashboard", tags=["Dashboards"])

# ===================== SCHEMAS =====================
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

class JobResponse(BaseModel):
    id: int
    title: str
    description: str
    location: str
    job_type: str
    company_name: str
    match_score: int

class ApplicationResponse(BaseModel):
    id: int
    job_title: str
    company_name: str
    status: str
    applied_at: str
    match_score: int

# ===================== CANDIDATE ROUTES =====================

@router.get("/jobs/all", response_model=List[JobResponse])
def get_all_jobs(db: Session = Depends(get_db)):
    """Kthen të gjitha punët me emrin e kompanisë dhe match score"""
    jobs = db.query(
        JobListing,
        CompanyProfile.company_name
    ).join(CompanyProfile, JobListing.company_id == CompanyProfile.id).all()

    result = []
    for job, company_name in jobs:
        result.append({
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "location": job.location,
            "job_type": job.job_type,
            "company_name": company_name or "Unknown Company",
            "match_score": 78 + (job.id % 18)   # 78% - 95% (fiktiv)
        })
    return result


@router.get("/applications/my/{candidate_id}", response_model=List[ApplicationResponse])
def get_my_applications(candidate_id: int, db: Session = Depends(get_db)):
    """Kthen aplikimet e kandidatit"""
    applications = db.query(
        Application,
        JobListing.title.label("job_title"),
        CompanyProfile.company_name
    ).join(JobListing, Application.job_id == JobListing.id)\
     .join(CompanyProfile, JobListing.company_id == CompanyProfile.id)\
     .filter(Application.candidate_id == candidate_id).all()

    return [{
        "id": app.id,
        "job_title": job_title,
        "company_name": company_name,
        "status": app.status,
        "applied_at": app.created_at.isoformat() if hasattr(app, 'created_at') and app.created_at else "",
        "match_score": 85
    } for app, job_title, company_name in applications]


@router.post("/applications/create")
def create_application(app_in: ApplicationCreate, db: Session = Depends(get_db)):
    """Krijon aplikim të ri"""
    new_app = Application(
        candidate_id=app_in.candidate_id,
        job_id=app_in.job_id,
        cv_file_id=app_in.cv_file_id,
        status="Pending"
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return {"message": "Application submitted successfully", "application_id": new_app.id}


# ===================== COMPANY ROUTES (Të paprekura) =====================

@router.get("/company/{user_id}")
def get_company_listings(user_id: int, db: Session = Depends(get_db)):
    company = db.query(CompanyProfile).filter(CompanyProfile.user_id == user_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")
    
    listings = db.query(JobListing).filter(JobListing.company_id == company.id).all()
    
    return {
        "my_listings": listings,
        "company_info": {
            "name": company.company_name,
            "industry": company.industry,
            "location": "Prishtina, Kosovë"
        }
    }


@router.post("/jobs/create")
def create_job(job_in: JobCreate, db: Session = Depends(get_db)):
    new_job = JobListing(
        company_id=job_in.company_id,
        title=job_in.title,
        description=job_in.description,
        location=job_in.location,
        job_type=job_in.job_type
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job


@router.get("/company/{user_id}/applicants")
def get_company_applicants(user_id: int, db: Session = Depends(get_db)):
    company = db.query(CompanyProfile).filter(CompanyProfile.user_id == user_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
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