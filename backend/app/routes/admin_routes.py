# Route-t e adminit — endpoint-et për menaxhimin e sistemit
# Të gjitha endpoint-et këtu janë të mbrojtura me require_admin()
# Vetëm user-ët me rol ADMIN mund t'i aksesojnë
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.database import get_db
from app.models import User, Role, CandidateProfile, CompanyProfile, JobListing, Application
from app.routes.auth_routes import get_current_user_info
from app.schemas.admin_schemas import (
    AdminStatsResponse,
    AdminUserRow,
    ToggleUserActiveResponse,
    AdminCompanyRow,
    ApproveCompanyResponse,
    RejectCompanyResponse,
    AdminJobRow,
    ToggleJobActiveResponse,
    AdminApplicationRow,
)

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ---------------------------------------------------------------------------
# AUTHORIZATION DEPENDENCY
# ---------------------------------------------------------------------------

def require_admin(current_user: dict = Depends(get_current_user_info)) -> dict:
    """
    Dependency i FastAPI — bllokон çdo request nga jo-adminët.
    Injektohet në çdo endpoint admin me Depends(require_admin).
    Hedh 403 Forbidden nëse roli nuk është ADMIN.
    """
    if current_user["role"] != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


# ---------------------------------------------------------------------------
# STATS
# ---------------------------------------------------------------------------

@router.get("/stats", response_model=AdminStatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Kthen numërimet statistikore të të gjithë sistemit për panelin e adminit."""
    total_users = db.query(func.count(User.id)).scalar()

    # Count users per role in one query
    role_counts = (
        db.query(Role.name, func.count(User.id))
        .join(User, User.role_id == Role.id)
        .group_by(Role.name)
        .all()
    )
    counts_by_role = {name: count for name, count in role_counts}

    total_jobs = db.query(func.count(JobListing.id)).scalar()
    active_jobs = db.query(func.count(JobListing.id)).filter(JobListing.is_active == True).scalar()
    inactive_jobs = db.query(func.count(JobListing.id)).filter(JobListing.is_active == False).scalar()

    total_companies = db.query(func.count(CompanyProfile.id)).scalar()

    # FIX: Vetëm kompanitë me user aktiv numërohen si "pending"
    # Kompanitë e refuzuara kanë is_active=False dhe nuk duhet të shfaqen sërisht si pending
    # Exclude inactive users so rejected companies (is_active=False) are never counted as pending
    pending_companies = (
        db.query(func.count(CompanyProfile.id))
        .join(User, CompanyProfile.user_id == User.id)
        .filter(CompanyProfile.is_approved == False, User.is_active == True)
        .scalar()
    )
    approved_companies = db.query(func.count(CompanyProfile.id)).filter(CompanyProfile.is_approved == True).scalar()

    total_applications = db.query(func.count(Application.id)).scalar()

    # Status counts — initialise all to 0 so missing statuses still appear
    status_template = {
        "Pending": 0,
        "Under Review": 0,
        "Interview": 0,
        "Accepted": 0,
        "Rejected": 0,
    }
    status_rows = (
        db.query(Application.status, func.count(Application.id))
        .group_by(Application.status)
        .all()
    )
    for status_val, count in status_rows:
        if status_val in status_template:
            status_template[status_val] = count

    return AdminStatsResponse(
        total_users=total_users,
        total_candidates=counts_by_role.get("CANDIDATE", 0),
        total_companies=counts_by_role.get("COMPANY", 0),
        pending_companies=pending_companies,
        approved_companies=approved_companies,
        active_jobs=active_jobs,
        inactive_jobs=inactive_jobs,
        total_jobs=total_jobs,
        total_applications=total_applications,
        applications_by_status=status_template,
    )


# ---------------------------------------------------------------------------
# USERS
# ---------------------------------------------------------------------------

@router.get("/users", response_model=list[AdminUserRow])
def get_all_users(
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Kthen listën e të gjithë user-ëve të renditur sipas datës së regjistrimit."""
    # joinedload avoids N+1: loads role in the same SELECT via JOIN
    users = (
        db.query(User)
        .options(joinedload(User.role))
        .order_by(User.created_at.desc())
        .all()
    )
    return [
        AdminUserRow(
            id=u.id,
            name=u.name,
            email=u.email,
            role=u.role.name,
            is_active=u.is_active,
            created_at=u.created_at,
        )
        for u in users
    ]


@router.put("/users/{user_id}/toggle-active", response_model=ToggleUserActiveResponse)
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(require_admin),
):
    """
    Aktivizon ose deaktivizon llogarinë e user-it.
    FIX: Admini nuk mund të deaktivizojë llogarinë e vet — mbrojtje nga bllokimi i sistemit.
    """
    if user_id == current_admin["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own admin account",
        )

    user = db.query(User).options(joinedload(User.role)).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)

    action = "activated" if user.is_active else "deactivated"
    return ToggleUserActiveResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        is_active=user.is_active,
        message=f"User {action} successfully",
    )


# ---------------------------------------------------------------------------
# COMPANIES
# NOTE: /companies/pending must be defined before /companies/{company_id}/...
# so FastAPI matches the literal "pending" before treating it as a path param.
# ---------------------------------------------------------------------------

@router.get("/companies", response_model=list[AdminCompanyRow])
def get_all_companies(
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Kthen të gjitha kompanitë — të paaprovuarat para të aprovuarave (sipas rendit të prioritetit)."""
    rows = (
        db.query(CompanyProfile, User.email)
        .join(User, CompanyProfile.user_id == User.id)
        .order_by(CompanyProfile.is_approved.asc(), CompanyProfile.created_at.desc())
        .all()
    )
    return [
        AdminCompanyRow(
            company_profile_id=cp.id,
            user_id=cp.user_id,
            company_name=cp.company_name,
            email=email,
            industry=cp.industry,
            description=cp.description,
            website=cp.website,
            is_approved=cp.is_approved,
            created_at=cp.created_at,
        )
        for cp, email in rows
    ]


@router.get("/companies/pending", response_model=list[AdminCompanyRow])
def get_pending_companies(
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Kthen kompanitë që presin miratim.
    FIX: Filtrohet edhe User.is_active == True — kompanitë e refuzuara (is_active=False)
    nuk duhet të shfaqen sërisht në listën e pritjes pas refuzimit.
    """
    rows = (
        db.query(CompanyProfile, User.email)
        .join(User, CompanyProfile.user_id == User.id)
        # Also require the user account to be active: rejected companies have
        # is_active=False and must never re-appear in the pending approvals list.
        .filter(CompanyProfile.is_approved == False, User.is_active == True)
        .order_by(CompanyProfile.created_at.desc())
        .all()
    )
    return [
        AdminCompanyRow(
            company_profile_id=cp.id,
            user_id=cp.user_id,
            company_name=cp.company_name,
            email=email,
            industry=cp.industry,
            description=cp.description,
            website=cp.website,
            is_approved=cp.is_approved,
            created_at=cp.created_at,
        )
        for cp, email in rows
    ]


@router.put("/companies/{company_id}/approve", response_model=ApproveCompanyResponse)
def approve_company(
    company_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Miraton kompanisë — pas kësaj ajo mund të postojë punë dhe të menaxhojë aplikimet.
    Nëse kompania është tashmë e aprovuar, kthen 400 për të shmangur operacione të kota.
    """
    company = db.query(CompanyProfile).filter(CompanyProfile.id == company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    if company.is_approved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company is already approved",
        )

    company.is_approved = True
    db.commit()
    db.refresh(company)

    return ApproveCompanyResponse(
        company_profile_id=company.id,
        company_name=company.company_name,
        is_approved=True,
        message="Company approved successfully",
    )


@router.put("/companies/{company_id}/reject", response_model=RejectCompanyResponse)
def reject_company(
    company_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Refuzon kompanisë duke deaktivizuar llogarinë e user-it të lidhur.
    FIX: Profili i kompanisë NUK fshihet — ruhet për auditim dhe historik.
    user.is_active=False parandalon login-in e kompanisë dhe zhduk nga lista pending.
    """
    company = db.query(CompanyProfile).filter(CompanyProfile.id == company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    # Deactivate the linked user account — do NOT delete the company profile
    user = db.query(User).filter(User.id == company.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Linked user not found")

    user.is_active = False
    db.commit()

    return RejectCompanyResponse(
        company_profile_id=company.id,
        company_name=company.company_name,
        user_deactivated=True,
        message="Company rejected and account deactivated. Profile kept for audit.",
    )


# ---------------------------------------------------------------------------
# JOBS
# ---------------------------------------------------------------------------

@router.get("/jobs", response_model=list[AdminJobRow])
def get_all_jobs(
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Kthen të gjitha shpalljet e punës (aktive dhe joaktive) me numrin e aplikimeve.
    Përdor outerjoin me Application — shpalljet pa aplikime shfaqen me applicants_count=0.
    """
    rows = (
        db.query(
            JobListing.id,
            JobListing.title,
            JobListing.company_id,
            JobListing.location,
            JobListing.job_type,
            JobListing.salary,
            JobListing.is_active,
            JobListing.deadline,
            JobListing.created_at,
            CompanyProfile.company_name,
            func.count(Application.id).label("applicants_count"),
        )
        .join(CompanyProfile, JobListing.company_id == CompanyProfile.id)
        .outerjoin(Application, Application.job_id == JobListing.id)
        .group_by(
            JobListing.id,
            JobListing.title,
            JobListing.company_id,
            JobListing.location,
            JobListing.job_type,
            JobListing.salary,
            JobListing.is_active,
            JobListing.deadline,
            JobListing.created_at,
            CompanyProfile.company_name,
        )
        .order_by(JobListing.created_at.desc())
        .all()
    )
    return [
        AdminJobRow(
            id=row.id,
            title=row.title,
            company_name=row.company_name,
            company_id=row.company_id,
            location=row.location,
            job_type=row.job_type,
            salary=float(row.salary) if row.salary is not None else None,
            is_active=row.is_active,
            deadline=row.deadline,
            created_at=row.created_at,
            applicants_count=row.applicants_count,
        )
        for row in rows
    ]


@router.put("/jobs/{job_id}/toggle-active", response_model=ToggleJobActiveResponse)
def toggle_job_active(
    job_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Aktivizon ose çaktivizoon një shpallje pune.
    FIX: Shpalljet e çaktivizuara nuk shfaqen te kandidatët dhe nuk pranojnë aplikime.
    """
    job = db.query(JobListing).filter(JobListing.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    job.is_active = not job.is_active
    db.commit()
    db.refresh(job)

    action = "activated" if job.is_active else "deactivated"
    return ToggleJobActiveResponse(
        id=job.id,
        title=job.title,
        is_active=job.is_active,
        message=f"Job listing {action} successfully",
    )


@router.delete("/jobs/{job_id}", status_code=status.HTTP_200_OK)
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Fshin permanentisht një shpallje pune nga databaza.
    Aplikimet fshihen para shpalljes për të respektuar çelësat e huaj (FK constraint).
    """
    job = db.query(JobListing).filter(JobListing.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    # Delete linked applications first to satisfy the FK constraint
    deleted_apps = db.query(Application).filter(Application.job_id == job_id).delete()
    db.delete(job)
    db.commit()

    return {
        "message": f"Job '{job.title}' deleted successfully",
        "applications_removed": deleted_apps,
    }


# ---------------------------------------------------------------------------
# APPLICATIONS
# ---------------------------------------------------------------------------

@router.get("/applications", response_model=list[AdminApplicationRow])
def get_all_applications(
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Kthen të gjitha aplikimet me të dhënat e kandidatit, punës dhe kompanisë.
    Përdor JOIN-e të shumta midis tabelave për të mbledhur të gjithë informacionin.
    """
    rows = (
        db.query(
            Application.id,
            Application.status,
            Application.applied_at,
            Application.updated_at,
            User.name.label("candidate_name"),
            User.email.label("candidate_email"),
            JobListing.title.label("job_title"),
            CompanyProfile.company_name,
        )
        .join(CandidateProfile, Application.candidate_id == CandidateProfile.id)
        .join(User, CandidateProfile.user_id == User.id)
        .join(JobListing, Application.job_id == JobListing.id)
        .join(CompanyProfile, JobListing.company_id == CompanyProfile.id)
        .order_by(Application.applied_at.desc())
        .all()
    )
    return [
        AdminApplicationRow(
            id=row.id,
            candidate_name=row.candidate_name,
            candidate_email=row.candidate_email,
            job_title=row.job_title,
            company_name=row.company_name,
            status=row.status,
            applied_at=row.applied_at,
            updated_at=row.updated_at,
        )
        for row in rows
    ]
