"""
Router i kandidatit — të gjitha endpoint-et e panelit të kandidatit.

Prefix:  /api/dashboard
Tag:     Candidate Dashboard

Endpoint-et:
  GET    /candidate/overview/{user_id}    — stats + recent apps + recommended jobs
  GET    /candidate/profile/{user_id}     — profili i plotë i kandidatit
  PUT    /candidate/profile/update        — përditëso profilin
  GET    /jobs/all                        — shpalljet aktive (me match score, salary, count)
  POST   /applications/create             — apliko për një vend pune
  GET    /applications/my/{user_id}       — aplikimet e mia (me pipeline info)
  DELETE /applications/cancel/{app_id}   — anulo aplikimin
  GET    /saved-jobs/my                   — punët e ruajtura
  POST   /saved-jobs/toggle/{job_id}      — ruaj / hiq nga të ruajturat
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import JobListing, Application, CandidateProfile, CompanyProfile, User
from app.models.saved_job import SavedJob
from app.models.file import File as FileRecord
from app.routes.auth_routes import get_current_user_info
from app.schemas.candidate_schemas import ApplicationCreate, CandidateProfileUpdate

router = APIRouter(prefix="/api/dashboard", tags=["Candidate Dashboard"])


# ─── HELPERS ─────────────────────────────────────────────────────────────────

def _require_candidate(current_user: dict):
    if current_user["role"] != "CANDIDATE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CANDIDATE access required",
        )


def _get_candidate_or_404(db: Session, user_id: int) -> CandidateProfile:
    candidate = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == user_id
    ).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
    return candidate


def _time_ago(dt) -> str:
    if not dt:
        return "recently"
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = now - dt
    days = diff.days
    if days == 0:
        return "today"
    if days == 1:
        return "1 day ago"
    if days < 7:
        return f"{days} days ago"
    weeks = days // 7
    if weeks == 1:
        return "1 week ago"
    return f"{weeks} weeks ago"


def _saved_ids_for(db: Session, candidate: CandidateProfile) -> set:
    rows = db.query(SavedJob.job_id).filter(
        SavedJob.candidate_id == candidate.id
    ).all()
    return {r.job_id for r in rows}


def _app_counts(db: Session) -> dict:
    rows = db.query(
        Application.job_id,
        func.count(Application.id).label("cnt")
    ).group_by(Application.job_id).all()
    return {r.job_id: r.cnt for r in rows}


def _build_job_dict(row, saved_ids: set, counts: dict) -> dict:
    d = dict(row._mapping)
    jid = d["id"]
    d["applicant_count"] = counts.get(jid, 0)
    d["is_saved"] = jid in saved_ids
    d["posted_ago"] = _time_ago(d.pop("created_at", None))
    if d.get("salary") is not None:
        d["salary"] = float(d["salary"])
    return d


# ─── GET /candidate/overview/{user_id} ───────────────────────────────────────

@router.get("/candidate/overview/{user_id}")
def get_candidate_overview(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    _require_candidate(current_user)
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    candidate = _get_candidate_or_404(db, user_id)
    user = db.query(User).filter(User.id == user_id).first()

    # Stats
    total_apps = db.query(Application).filter(
        Application.candidate_id == candidate.id
    ).count()
    in_review = db.query(Application).filter(
        Application.candidate_id == candidate.id,
        Application.status == "Under Review",
    ).count()
    interviews = db.query(Application).filter(
        Application.candidate_id == candidate.id,
        Application.status == "Interview",
    ).count()
    saved_count = db.query(SavedJob).filter(
        SavedJob.candidate_id == candidate.id
    ).count()

    # Recent applications
    recent_rows = (
        db.query(
            Application.id.label("app_id"),
            Application.status,
            Application.applied_at,
            JobListing.title.label("job_title"),
            CompanyProfile.company_name,
        )
        .join(JobListing, Application.job_id == JobListing.id)
        .join(CompanyProfile, JobListing.company_id == CompanyProfile.id)
        .filter(Application.candidate_id == candidate.id)
        .order_by(Application.applied_at.desc())
        .limit(5)
        .all()
    )

    recent_apps = []
    for row in recent_rows:
        d = dict(row._mapping)
        at = d.pop("applied_at")
        d["applied_at_formatted"] = at.strftime("Applied %b %d, %Y") if at else ""
        recent_apps.append(d)

    # Recommended jobs (top 3 active by match score)
    job_rows = (
        db.query(
            JobListing.id,
            JobListing.title,
            JobListing.description,
            JobListing.location,
            JobListing.job_type,
            JobListing.salary,
            JobListing.created_at,
            CompanyProfile.company_name,
        )
        .join(CompanyProfile, JobListing.company_id == CompanyProfile.id)
        .filter(JobListing.is_active == True)
        .all()
    )

    saved_ids = _saved_ids_for(db, candidate)
    counts = _app_counts(db)
    all_jobs = [_build_job_dict(r, saved_ids, counts) for r in job_rows]
    recommended = sorted(all_jobs, key=lambda j: -j["applicant_count"])[:3]

    return {
        "candidate_info": {
            "name": user.name if user else "",
            "headline": candidate.headline,
        },
        "stats": {
            "total_apps": total_apps,
            "in_review": in_review,
            "interviews": interviews,
            "saved_jobs": saved_count,
        },
        "recent_applications": recent_apps,
        "recommended_jobs": recommended,
    }


# ─── GET /candidate/profile/{user_id} ────────────────────────────────────────

@router.get("/candidate/profile/{user_id}")
def get_candidate_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    _require_candidate(current_user)
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    candidate = _get_candidate_or_404(db, user_id)
    user = db.query(User).filter(User.id == user_id).first()

    # Fetch current CV file info if one has been uploaded
    cv_filename = None
    cv_uploaded_at = None
    if candidate.cv_file_id:
        cv_file = db.query(FileRecord).filter(FileRecord.id == candidate.cv_file_id).first()
        if cv_file:
            cv_filename = cv_file.filename
            cv_uploaded_at = cv_file.created_at.strftime("%b %d, %Y") if cv_file.created_at else None

    return {
        "name": user.name if user else "",
        "email": user.email if user else "",
        "headline": candidate.headline,
        "professional_summary": candidate.professional_summary,
        "skills": candidate.skills,
        "experience_level": candidate.experience_level,
        "phone": candidate.phone,
        "location": candidate.location,
        "linkedin_url": candidate.linkedin_url,
        "cv_file_id": candidate.cv_file_id,
        "cv_filename": cv_filename,
        "cv_uploaded_at": cv_uploaded_at,
    }


# ─── PUT /candidate/profile/update ───────────────────────────────────────────

@router.put("/candidate/profile/update")
def update_candidate_profile(
    profile_in: CandidateProfileUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    _require_candidate(current_user)
    candidate = _get_candidate_or_404(db, current_user["user_id"])

    for key, val in profile_in.model_dump(exclude_unset=True).items():
        setattr(candidate, key, val)

    db.commit()
    db.refresh(candidate)
    return {"message": "Profile updated successfully"}


# ─── GET /jobs/all ────────────────────────────────────────────────────────────

@router.get("/jobs/all")
def get_all_jobs(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    candidate = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == current_user["user_id"]
    ).first() if current_user["role"] == "CANDIDATE" else None

    saved_ids = _saved_ids_for(db, candidate) if candidate else set()
    counts = _app_counts(db)

    results = (
        db.query(
            JobListing.id,
            JobListing.title,
            JobListing.description,
            JobListing.location,
            JobListing.job_type,
            JobListing.salary,
            JobListing.created_at,
            CompanyProfile.company_name,
        )
        .join(CompanyProfile, JobListing.company_id == CompanyProfile.id)
        .filter(JobListing.is_active == True)
        .all()
    )

    return [_build_job_dict(r, saved_ids, counts) for r in results]


# ─── POST /applications/create ───────────────────────────────────────────────

@router.post("/applications/create")
def create_application(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    _require_candidate(current_user)
    candidate = _get_candidate_or_404(db, current_user["user_id"])

    job = db.query(JobListing).filter(JobListing.id == app_in.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if not job.is_active:
        raise HTTPException(
            status_code=400,
            detail="This job is no longer active and cannot receive applications",
        )

    existing = db.query(Application).filter(
        Application.candidate_id == candidate.id,
        Application.job_id == app_in.job_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this job")

    # Use explicitly provided cv_file_id, or fall back to candidate's default CV
    cv_file_id = app_in.cv_file_id or candidate.cv_file_id

    new_app = Application(
        candidate_id=candidate.id,
        job_id=app_in.job_id,
        cv_file_id=cv_file_id,
        status="Pending",
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return {"message": "Application submitted successfully", "id": new_app.id}


# ─── GET /applications/my/{user_id} ──────────────────────────────────────────

@router.get("/applications/my/{user_id}")
def get_my_applications(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    _require_candidate(current_user)
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    candidate = _get_candidate_or_404(db, user_id)

    results = (
        db.query(
            Application.id.label("app_id"),
            Application.status,
            Application.applied_at,
            JobListing.title.label("job_title"),
            CompanyProfile.company_name,
        )
        .join(JobListing, Application.job_id == JobListing.id)
        .join(CompanyProfile, JobListing.company_id == CompanyProfile.id)
        .filter(Application.candidate_id == candidate.id)
        .order_by(Application.applied_at.desc())
        .all()
    )

    apps = []
    for row in results:
        d = dict(row._mapping)
        at = d.pop("applied_at")
        d["applied_at_formatted"] = at.strftime("Applied %b %d, %Y") if at else ""
        apps.append(d)
    return apps


# ─── DELETE /applications/cancel/{app_id} ────────────────────────────────────

@router.delete("/applications/cancel/{app_id}")
def cancel_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    _require_candidate(current_user)
    candidate = _get_candidate_or_404(db, current_user["user_id"])

    application = db.query(Application).filter(Application.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    if application.candidate_id != candidate.id:
        raise HTTPException(status_code=403, detail="You do not own this application")

    db.delete(application)
    db.commit()
    return {"message": "Application canceled successfully"}


# ─── GET /saved-jobs/my ──────────────────────────────────────────────────────

@router.get("/saved-jobs/my")
def get_saved_jobs(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    _require_candidate(current_user)
    candidate = _get_candidate_or_404(db, current_user["user_id"])

    saved_ids = _saved_ids_for(db, candidate)
    counts = _app_counts(db)

    results = (
        db.query(
            JobListing.id,
            JobListing.title,
            JobListing.description,
            JobListing.location,
            JobListing.job_type,
            JobListing.salary,
            JobListing.created_at,
            CompanyProfile.company_name,
        )
        .join(CompanyProfile, JobListing.company_id == CompanyProfile.id)
        .join(SavedJob, SavedJob.job_id == JobListing.id)
        .filter(SavedJob.candidate_id == candidate.id)
        .all()
    )

    return [_build_job_dict(r, saved_ids, counts) for r in results]


# ─── POST /saved-jobs/toggle/{job_id} ────────────────────────────────────────

@router.post("/saved-jobs/toggle/{job_id}")
def toggle_saved_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    _require_candidate(current_user)
    candidate = _get_candidate_or_404(db, current_user["user_id"])

    existing = db.query(SavedJob).filter(
        SavedJob.candidate_id == candidate.id,
        SavedJob.job_id == job_id,
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"saved": False}

    job = db.query(JobListing).filter(JobListing.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    db.add(SavedJob(candidate_id=candidate.id, job_id=job_id))
    db.commit()
    return {"saved": True}
