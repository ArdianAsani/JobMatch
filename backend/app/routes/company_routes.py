"""
Router i kompanisë — të gjitha endpoint-et e panelit të kompanisë.

Prefix:  /api/dashboard
Tag:     Company Dashboard

Endpoint-et:
  GET    /company/{user_id}            — paneli me statistika + shpallje
  PUT    /company/profile/update       — modifiko profilin e kompanisë
  POST   /jobs/create                  — krijo shpallje të re (vetëm nëse është aprovuar)
  PUT    /jobs/update/{job_id}         — modifiko shpallje ekzistuese
  DELETE /jobs/delete/{job_id}         — fshi shpallje + aplikimet e lidhura
  GET    /company/{user_id}/applicants — të gjithë aplikantët e kompanisë
  PUT    /applications/status/{app_id} — ndrysho statusin e aplikimit
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func as sqlfunc
from datetime import datetime, timedelta

from app.database import get_db
from app.models import JobListing, Application, CandidateProfile, CompanyProfile, User
from app.models.file import File as FileRecord
from app.routes.auth_routes import get_current_user_info
from app.schemas.company_schemas import (
    JobCreate,
    JobUpdate,
    CompanyProfileUpdate,
    ApplicationStatusUpdate,
)

router = APIRouter(prefix="/api/dashboard", tags=["Company Dashboard"])


# ─── HELPERS ─────────────────────────────────────────────────────────────────

def _require_company(current_user: dict):
    if current_user["role"] != "COMPANY":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="COMPANY access required",
        )


def _get_company_or_404(db: Session, user_id: int) -> CompanyProfile:
    company = db.query(CompanyProfile).filter(CompanyProfile.user_id == user_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")
    return company


def _require_approved(company: CompanyProfile):
    """Blloko operacionet e kompanisë nëse ende nuk është aprovuar nga admini."""
    if not company.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Company account is pending admin approval",
        )


def _time_ago(dt) -> str:
    """Konverto datetime në string relativ (p.sh. '5 days ago')."""
    if dt is None:
        return "—"
    now = datetime.utcnow()
    if hasattr(dt, "replace"):
        dt = dt.replace(tzinfo=None)
    diff = now - dt
    days = diff.days
    if days == 0:
        return "Today"
    if days == 1:
        return "1 day ago"
    if days < 7:
        return f"{days} days ago"
    weeks = days // 7
    if weeks == 1:
        return "1 week ago"
    if weeks < 5:
        return f"{weeks} weeks ago"
    months = days // 30
    return f"{months} month{'s' if months > 1 else ''} ago"


# ─── GET /company/{user_id} ───────────────────────────────────────────────────

@router.get("/company/{user_id}")
def get_company_dashboard(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    """
    Kthen panelin e plotë të kompanisë:
      - Informacionin e profilit
      - Listën e shpalljeve me numrin e aplikimeve
      - Statistikat: total, sot, funnel sipas statusit, grafik javor
    """
    _require_company(current_user)
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    company = _get_company_or_404(db, user_id)
    listings = db.query(JobListing).filter(JobListing.company_id == company.id).all()

    # Numri i aplikimeve për çdo shpallje — një query, jo N queries
    job_ids = [j.id for j in listings]
    app_counts: dict[int, int] = {}
    if job_ids:
        rows = (
            db.query(Application.job_id, sqlfunc.count(Application.id))
            .filter(Application.job_id.in_(job_ids))
            .group_by(Application.job_id)
            .all()
        )
        app_counts = {job_id: cnt for job_id, cnt in rows}

    total_applicants = sum(app_counts.values())

    # Aplikime të reja sot (UTC)
    today = datetime.utcnow().date()
    new_today = 0
    if job_ids:
        new_today = (
            db.query(sqlfunc.count(Application.id))
            .join(JobListing, Application.job_id == JobListing.id)
            .filter(JobListing.company_id == company.id)
            .filter(sqlfunc.date(Application.applied_at) == today)
            .scalar()
            or 0
        )

    # Numërim sipas statusit — për hiring funnel
    by_status: dict = {}
    if job_ids:
        status_rows = (
            db.query(Application.status, sqlfunc.count(Application.id))
            .join(JobListing, Application.job_id == JobListing.id)
            .filter(JobListing.company_id == company.id)
            .group_by(Application.status)
            .all()
        )
        by_status = {s: c for s, c in status_rows}

    # Grafiku javor — aplikimet e 7 ditëve të fundit
    weekly = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        cnt = 0
        if job_ids:
            cnt = (
                db.query(sqlfunc.count(Application.id))
                .join(JobListing, Application.job_id == JobListing.id)
                .filter(JobListing.company_id == company.id)
                .filter(sqlfunc.date(Application.applied_at) == day)
                .scalar()
                or 0
            )
        weekly.append({"day": day.strftime("%a"), "count": cnt})

    # Ndërtimi i listës së shpalljeve me të dhëna shtesë
    listings_out = [
        {
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "location": job.location,
            "job_type": job.job_type,
            "salary": float(job.salary) if job.salary else None,
            "requirements": job.requirements,
            "skills_required": job.skills_required,
            "deadline": str(job.deadline) if job.deadline else None,
            "is_active": job.is_active,
            "created_at": job.created_at.isoformat() if job.created_at else None,
            "posted_ago": _time_ago(job.created_at),
            "applicant_count": app_counts.get(job.id, 0),
        }
        for job in listings
    ]

    return {
        "company_info": {
            "id": company.id,
            "name": company.company_name,
            "industry": company.industry,
            "description": company.description,
            "website": company.website,
            "company_size": company.company_size,
            "founded_year": company.founded_year,
            "hq_location": company.hq_location,
            "is_approved": company.is_approved,
        },
        "my_listings": listings_out,
        "stats": {
            "total_applicants": total_applicants,
            "new_today": new_today,
            "active_listings": sum(1 for j in listings if j.is_active),
            "by_status": by_status,
            "weekly": weekly,
        },
    }


# ─── PUT /company/profile/update ─────────────────────────────────────────────

@router.put("/company/profile/update")
def update_company_profile(
    profile_in: CompanyProfileUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    """
    Modifikon profilin e kompanisë (emri, industria, website, pershkrimi, etj.).
    company_id merret nga JWT — jo nga klienti.
    """
    _require_company(current_user)
    company = _get_company_or_404(db, current_user["user_id"])

    for key, value in profile_in.model_dump(exclude_unset=True).items():
        setattr(company, key, value)

    db.commit()
    db.refresh(company)
    return {"message": "Profile updated successfully"}


# ─── POST /jobs/create ────────────────────────────────────────────────────────

@router.post("/jobs/create", status_code=status.HTTP_201_CREATED)
def create_job(
    job_in: JobCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    """
    Krijon shpallje të re pune.
    Vetëm kompanitë e aprovuara mund të postojnë.
    company_id merret nga JWT — jo nga klienti.
    """
    _require_company(current_user)
    company = _get_company_or_404(db, current_user["user_id"])
    _require_approved(company)

    deadline = None
    if job_in.deadline:
        try:
            deadline = datetime.strptime(job_in.deadline, "%Y-%m-%d").date()
        except ValueError:
            pass

    new_job = JobListing(
        company_id=company.id,
        title=job_in.title,
        description=job_in.description,
        location=job_in.location,
        job_type=job_in.job_type,
        salary=job_in.salary,
        requirements=job_in.requirements,
        skills_required=job_in.skills_required,
        deadline=deadline,
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return {"message": "Job created successfully", "id": new_job.id}


# ─── PUT /jobs/update/{job_id} ───────────────────────────────────────────────

@router.put("/jobs/update/{job_id}")
def update_job(
    job_id: int,
    job_in: JobUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    """
    Modifikon shpallje ekzistuese.
    Verifikohet që shpallja i përket kompanisë që bën kërkesën.
    """
    _require_company(current_user)
    company = _get_company_or_404(db, current_user["user_id"])
    _require_approved(company)

    job = db.query(JobListing).filter(JobListing.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.company_id != company.id:
        raise HTTPException(status_code=403, detail="You do not own this job listing")

    update_data = job_in.model_dump(exclude_unset=True)

    # Konverto deadline string → date object
    if "deadline" in update_data and update_data["deadline"]:
        try:
            update_data["deadline"] = datetime.strptime(
                update_data["deadline"], "%Y-%m-%d"
            ).date()
        except ValueError:
            update_data.pop("deadline")

    for key, value in update_data.items():
        setattr(job, key, value)

    db.commit()
    db.refresh(job)
    return {"message": "Job updated successfully", "id": job.id}


# ─── DELETE /jobs/delete/{job_id} ────────────────────────────────────────────

@router.delete("/jobs/delete/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    """
    Fshin shpallje pune dhe të gjitha aplikimet e lidhura me të.
    Aplikimet fshihen para shpalljes për të respektuar FK constraint.
    """
    _require_company(current_user)
    company = _get_company_or_404(db, current_user["user_id"])
    _require_approved(company)

    job = db.query(JobListing).filter(JobListing.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.company_id != company.id:
        raise HTTPException(status_code=403, detail="You do not own this job listing")

    db.query(Application).filter(Application.job_id == job_id).delete()
    db.delete(job)
    db.commit()
    return {"message": "Job and linked applications deleted successfully"}


# ─── GET /company/{user_id}/applicants ───────────────────────────────────────

@router.get("/company/{user_id}/applicants")
def get_company_applicants(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    """
    Kthen listën e të gjithë aplikantëve për punët e kësaj kompanie.
    Përfshin: emrin real (nga User), aftësitë, datën e aplikimit, match score.
    """
    _require_company(current_user)
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    company = _get_company_or_404(db, user_id)

    results = (
        db.query(
            Application.id.label("app_id"),
            Application.status.label("app_status"),
            Application.applied_at.label("applied_at"),
            JobListing.title.label("job_title"),
            CandidateProfile.headline.label("candidate_headline"),
            CandidateProfile.professional_summary.label("candidate_summary"),
            CandidateProfile.skills.label("candidate_skills"),
            User.name.label("candidate_name"),
            Application.cv_file_id.label("cv_file_id"),
            FileRecord.filename.label("cv_filename"),
        )
        .join(JobListing, Application.job_id == JobListing.id)
        .join(CandidateProfile, Application.candidate_id == CandidateProfile.id)
        .join(User, CandidateProfile.user_id == User.id)
        .outerjoin(FileRecord, Application.cv_file_id == FileRecord.id)
        .filter(JobListing.company_id == company.id)
        .order_by(Application.applied_at.desc())
        .all()
    )

    out = []
    for row in results:
        d = dict(row._mapping)
        applied_at = d.pop("applied_at", None)
        d["applied_at_formatted"] = (
            applied_at.strftime("%b %d") if applied_at else "—"
        )
        out.append(d)
    return out


# ─── PUT /applications/status/{app_id} ───────────────────────────────────────

@router.put("/applications/status/{app_id}")
def update_application_status(
    app_id: int,
    status_in: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    """
    Ndryshon statusin e aplikimit nga kompania.
    Verifikohet që aplikimi i përket një pune të kësaj kompanie.
    """
    _require_company(current_user)
    company = _get_company_or_404(db, current_user["user_id"])
    _require_approved(company)

    application = db.query(Application).filter(Application.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    job = db.query(JobListing).filter(JobListing.id == application.job_id).first()
    if not job or job.company_id != company.id:
        raise HTTPException(status_code=403, detail="Access denied to this application")

    application.status = status_in.status
    db.commit()
    return {"message": "Status updated successfully", "new_status": application.status}
