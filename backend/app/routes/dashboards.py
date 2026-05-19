# Route-t e dashboard-eve — endpoint-et për kompanitë dhe kandidatët
# Të gjitha endpoint-et këtu janë të mbrojtura me JWT (Depends(get_current_user_info))
# Autorizimi bazë mbi rol bëhet me helper-in _require_role()
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import random
from app.database import get_db
from app.models import JobListing, Application, CandidateProfile, CompanyProfile
from app.routes.auth_routes import get_current_user_info

router = APIRouter(prefix="/api/dashboard", tags=["Dashboards"])


# --- PYDANTIC SCHEMAS ---

class JobCreate(BaseModel):
    # company_id removed — derived from JWT on the backend
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
    # candidate_id removed — derived from JWT on the backend
    job_id: int
    cv_file_id: Optional[int] = None  # optional until file upload is implemented


class ApplicationStatusUpdate(BaseModel):
    status: str  # 'Pending', 'Under Review', 'Interview', 'Accepted', 'Rejected'


# --- INTERNAL HELPERS ---

def _require_role(current_user: dict, required_role: str):
    """Hedh 403 nëse roli i user-it aktual nuk përputhet me rolin e kërkuar."""
    if current_user["role"] != required_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"{required_role} access required",
        )


def _get_company_or_404(db: Session, user_id: int) -> CompanyProfile:
    """Kërkon profilin e kompanisë sipas user_id. Hedh 404 nëse nuk gjendet."""
    company = db.query(CompanyProfile).filter(CompanyProfile.user_id == user_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found")
    return company


def _require_approved(company: CompanyProfile):
    """
    Bllokون operacionet e kompanisë nëse profili nuk është miratuar nga admini.
    Kompanitë e paaprovuara nuk mund të postojnë ose modifikojnë punët.
    """
    if not company.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Company account is pending admin approval",
        )


def _get_candidate_or_404(db: Session, user_id: int) -> CandidateProfile:
    """Kërkon profilin e kandidatit sipas user_id. Hedh 404 nëse nuk gjendet."""
    candidate = db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate profile not found")
    return candidate


# --- COMPANY ENDPOINTS ---

@router.get("/company/{user_id}")
def get_company_dashboard(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    """Kthen panelin e kompanisë me listën e shpalljeve të saj."""
    _require_role(current_user, "COMPANY")
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    company = _get_company_or_404(db, user_id)

    listings = db.query(JobListing).filter(JobListing.company_id == company.id).all()
    return {
        "my_listings": listings,
        "company_info": {
            "id": company.id,
            "name": company.company_name,
            "industry": company.industry,
            "location": "Prishtina, Kosovë",
            "is_approved": company.is_approved,
        },
    }


@router.post("/jobs/create", status_code=status.HTTP_201_CREATED)
def create_job(
    job_in: JobCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    """
    Krijon një shpallje të re pune.
    Vetëm kompanitë e miratuara mund të postojnë punë.
    company_id merret nga JWT — jo nga klienti — për të shmangur manipulimin.
    """
    _require_role(current_user, "COMPANY")
    company = _get_company_or_404(db, current_user["user_id"])
    _require_approved(company)

    new_job = JobListing(
        company_id=company.id,
        title=job_in.title,
        description=job_in.description,
        location=job_in.location,
        job_type=job_in.job_type,
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job


@router.put("/jobs/update/{job_id}")
def update_job(
    job_id: int,
    job_out: JobUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    """
    Modifikon një shpallje ekzistuese.
    Verifikohet që shpallja i përket kompanisë që bën kërkesën.
    """
    _require_role(current_user, "COMPANY")
    company = _get_company_or_404(db, current_user["user_id"])
    _require_approved(company)

    job = db.query(JobListing).filter(JobListing.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found")
    if job.company_id != company.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this job listing")

    for key, value in job_out.dict(exclude_unset=True).items():
        setattr(job, key, value)

    db.commit()
    db.refresh(job)
    return job


@router.delete("/jobs/delete/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    """
    Fshin një shpallje pune dhe të gjitha aplikimet e lidhura me të.
    Aplikimet fshihen para shpalljes për të respektuar çelësat e huaj (FK constraint).
    """
    _require_role(current_user, "COMPANY")
    company = _get_company_or_404(db, current_user["user_id"])
    _require_approved(company)

    job = db.query(JobListing).filter(JobListing.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found")
    if job.company_id != company.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this job listing")

    db.query(Application).filter(Application.job_id == job_id).delete()
    db.delete(job)
    db.commit()
    return {"message": "Job and linked applications deleted successfully"}


@router.get("/company/{user_id}/applicants")
def get_company_applicants(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    """Kthen listën e të gjithë aplikantëve për punët e kësaj kompanie."""
    _require_role(current_user, "COMPANY")
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    company = db.query(CompanyProfile).filter(CompanyProfile.user_id == user_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    results = (
        db.query(
            Application.id.label("app_id"),
            Application.status.label("app_status"),
            JobListing.title.label("job_title"),
            CandidateProfile.headline.label("candidate_name"),
            CandidateProfile.summary.label("candidate_summary"),
            CandidateProfile.skills.label("candidate_skills"),
        )
        .join(JobListing, Application.job_id == JobListing.id)
        .join(CandidateProfile, Application.candidate_id == CandidateProfile.id)
        .filter(JobListing.company_id == company.id)
        .all()
    )
    return [dict(row._mapping) for row in results]


@router.put("/applications/status/{app_id}")
def update_application_status(
    app_id: int,
    status_in: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    """
    Ndryshon statusin e aplikimit nga kompania (p.sh. nga Pending në Under Review).
    Verifikohet që aplikimi i përket një pune të kësaj kompanie — jo të tjetrës.
    """
    _require_role(current_user, "COMPANY")
    company = _get_company_or_404(db, current_user["user_id"])
    _require_approved(company)

    application = db.query(Application).filter(Application.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Verify this application belongs to one of the company's own jobs
    job = db.query(JobListing).filter(JobListing.id == application.job_id).first()
    if not job or job.company_id != company.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this application")

    application.status = status_in.status
    db.commit()
    db.refresh(application)
    return {"message": "Status updated successfully", "new_status": application.status}


# --- CANDIDATE ENDPOINTS ---

@router.get("/jobs/all")
def get_all_jobs(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    """
    Kthen të gjitha shpalljet aktive të punës me emrin e kompanisë.
    FIX: Filtrohen vetëm punët aktive (is_active=True) — punët e çaktivizuara nga admini
    nuk shfaqen dhe nuk mund të marrin aplikime.
    """
    results = (
        db.query(
            JobListing.id, JobListing.title, JobListing.description,
            JobListing.location, JobListing.job_type, CompanyProfile.company_name,
        )
        .join(CompanyProfile, JobListing.company_id == CompanyProfile.id)
        # Only expose jobs that are active — admin may deactivate any listing
        .filter(JobListing.is_active == True)
        .all()
    )

    jobs_list = []
    for row in results:
        job_data = dict(row._mapping)
        random.seed(job_data["id"] + 42)
        job_data["match_score"] = random.randint(75, 98)
        jobs_list.append(job_data)
    return jobs_list


@router.post("/applications/create")
def create_application(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    """
    Krijon aplikimin e kandidatit për një vend pune.

    FIX: Verifikohet në server-side nëse puna është ende aktive.
    Kjo mbron kundër rasteve kur frontend-i ka gjendjen e vjetër të punëve.
    Shpallja e çaktivizuar hedh 400 — kandidati nuk mund të aplikojë.
    Gjithashtu kontrollohet nëse kandidati ka aplikuar tashmë për të njëjtën punë.
    """
    _require_role(current_user, "CANDIDATE")
    candidate = _get_candidate_or_404(db, current_user["user_id"])

    # Guard against stale frontend state: reject applications to inactive jobs server-side
    job = db.query(JobListing).filter(JobListing.id == app_in.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if not job.is_active:
        raise HTTPException(status_code=400, detail="This job is no longer active and cannot receive applications")

    existing = db.query(Application).filter(
        Application.candidate_id == candidate.id,
        Application.job_id == app_in.job_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this job.")

    new_app = Application(
        candidate_id=candidate.id,
        job_id=app_in.job_id,
        cv_file_id=app_in.cv_file_id,
        status="Pending",
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return {"message": "Success", "id": new_app.id}


@router.get("/applications/my/{user_id}")
def get_my_applications(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    """
    Kthen të gjitha aplikimet e kandidatit me titullin e punës dhe emrin e kompanisë.
    Kandidati mund të shohë vetëm aplikimet e veta — jo të kandidatëve të tjerë.
    """
    _require_role(current_user, "CANDIDATE")
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    candidate = _get_candidate_or_404(db, user_id)

    results = (
        db.query(
            Application.id.label("app_id"),
            Application.status,
            JobListing.title.label("job_title"),
            CompanyProfile.company_name,
        )
        .join(JobListing, Application.job_id == JobListing.id)
        .join(CompanyProfile, JobListing.company_id == CompanyProfile.id)
        .filter(Application.candidate_id == candidate.id)
        .all()
    )
    return [dict(row._mapping) for row in results]


@router.delete("/applications/cancel/{app_id}")
def cancel_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    """
    Anulon aplikimin e kandidatit.
    Verifikohet që aplikimi i përket kandidatit aktual — jo dikujt tjetër.
    """
    _require_role(current_user, "CANDIDATE")
    candidate = _get_candidate_or_404(db, current_user["user_id"])

    application = db.query(Application).filter(Application.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    if application.candidate_id != candidate.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this application")

    db.delete(application)
    db.commit()
    return {"message": "Application canceled successfully"}
