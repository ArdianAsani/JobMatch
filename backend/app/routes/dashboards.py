from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import random
from app.database import get_db
from app.models import JobListing, Application, CandidateProfile, CompanyProfile, File

router = APIRouter(prefix="/api/dashboard", tags=["Dashboards"])

# --- PYDANTIC SCHEMAS ---
class JobCreate(BaseModel):
    company_id: int
    title: str
    description: str
    location: str = "Prishtina"
    job_type: str = "Full-time"

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None

class ApplicationCreate(BaseModel):
    candidate_id: int
    job_id: int
    cv_file_id: int

class ApplicationStatusUpdate(BaseModel):
    status: str  # 'Pending', 'Under Review', 'Interview', 'Accepted', 'Rejected'

# --- 1. COMPANY CRUD & FEATURES ---

# CREATE Job
@router.post("/jobs/create", status_code=status.HTTP_201_CREATED)
def create_job(job_in: JobCreate, db: Session = Depends(get_db)):
    new_job = JobListing(
        company_id=job_in.company_id, title=job_in.title, 
        description=job_in.description, location=job_in.location, job_type=job_in.job_type
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

# READ Company Profile & Listings
@router.get("/company/{user_id}")
def get_company_dashboard(user_id: int, db: Session = Depends(get_db)):
    company = db.query(CompanyProfile).filter(CompanyProfile.user_id == user_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")
    listings = db.query(JobListing).filter(JobListing.company_id == company.id).all()
    return {
        "my_listings": listings,
        "company_info": {
            "id": company.id,
            "name": company.company_name,
            "industry": company.industry,
            "location": "Prishtina, Kosovë"
        }
    }

# UPDATE Job
@router.put("/jobs/update/{job_id}")
def update_job(job_id: int, job_out: JobUpdate, db: Session = Depends(get_db)):
    job = db.query(JobListing).filter(JobListing.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found")
    
    for key, value in job_out.dict(exclude_unset=True).items():
        setattr(job, key, value)
        
    db.commit()
    db.refresh(job)
    return job

# DELETE Job
@router.delete("/jobs/delete/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobListing).filter(JobListing.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found")
    
    # Fshijmë aplikimet e lidhura me këtë punë fillimisht për të ruajtur integritetin struktural
    db.query(Application).filter(Application.job_id == job_id).delete()
    db.delete(job)
    db.commit()
    return {"message": "Job and linked applications deleted successfully"}

# READ Applicants for Company
@router.get("/company/{user_id}/applicants")
def get_company_applicants(user_id: int, db: Session = Depends(get_db)):
    company = db.query(CompanyProfile).filter(CompanyProfile.user_id == user_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    results = db.query(
        Application.id.label("app_id"),
        Application.status.label("app_status"),
        JobListing.title.label("job_title"),
        CandidateProfile.headline.label("candidate_name"),
        CandidateProfile.summary.label("candidate_summary"),
        CandidateProfile.skills.label("candidate_skills")
    ).join(JobListing, Application.job_id == JobListing.id) \
     .join(CandidateProfile, Application.candidate_id == CandidateProfile.id) \
     .filter(JobListing.company_id == company.id).all()
    
    return [dict(row._mapping) for row in results]

# UPDATE Application Status (Accept/Reject)
@router.put("/applications/status/{app_id}")
def update_application_status(app_id: int, status_in: ApplicationStatusUpdate, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    application.status = status_in.status
    db.commit()
    db.refresh(application)
    return {"message": "Status updated successfully", "new_status": application.status}


# --- 2. CANDIDATE CRUD & FEATURES ---

# READ All Available Jobs (For Explore Tab)
@router.get("/jobs/all")
def get_all_jobs(db: Session = Depends(get_db)):
    results = db.query(
        JobListing.id, JobListing.title, JobListing.description,
        JobListing.location, JobListing.job_type, CompanyProfile.company_name
    ).join(CompanyProfile, JobListing.company_id == CompanyProfile.id).all()
    
    jobs_list = []
    for row in results:
        job_data = dict(row._mapping)
        random.seed(job_data['id'] + 42)
        job_data['match_score'] = random.randint(75, 98)
        jobs_list.append(job_data)
    return jobs_list

# CREATE Application (Apply Now)
@router.post("/applications/create")
def create_application(app_in: ApplicationCreate, db: Session = Depends(get_db)):
    # Kontroll nëse studenti ka aplikuar tashmë për të njëjtën punë
    existing = db.query(Application).filter(
        Application.candidate_id == app_in.candidate_id, 
        Application.job_id == app_in.job_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this job.")

    new_app = Application(
        candidate_id=app_in.candidate_id, job_id=app_in.job_id, 
        cv_file_id=app_in.cv_file_id, status="Pending"
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return {"message": "Success", "id": new_app.id}

# READ Candidate's Own Applications
@router.get("/applications/my/{candidate_id}")
def get_my_applications(candidate_id: int, db: Session = Depends(get_db)):
    results = db.query(
        Application.id.label("app_id"),
        Application.status,
        JobListing.title.label("job_title"),
        CompanyProfile.company_name
    ).join(JobListing, Application.job_id == JobListing.id) \
     .join(CompanyProfile, JobListing.company_id == CompanyProfile.id) \
     .filter(Application.candidate_id == candidate_id).all()
     
    return [dict(row._mapping) for row in results]

# DELETE Application (Cancel Application)
@router.delete("/applications/cancel/{app_id}")
def cancel_application(app_id: int, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db.delete(application)
    db.commit()
    return {"message": "Application canceled successfully"}