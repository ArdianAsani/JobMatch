"""
Router për ngarkimin dhe shkarkimin e skedarëve.

Prefix:  /api/files
Tag:     Files

Endpoint-et:
  POST /cv              — ngarkon CV-në, ruan në disk dhe DB
  GET  /cv/{file_id}   — shkarkon CV-në me kontroll autentikimi dhe lejesh
"""
import os
import uuid
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Application, JobListing, CandidateProfile, CompanyProfile
from app.models.file import File as FileRecord
from app.routes.auth_routes import get_current_user_info

router = APIRouter(prefix="/api/files", tags=["Files"])

CV_UPLOAD_DIR = "uploads/cv"
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

MIME_TYPES = {
    ".pdf":  "application/pdf",
    ".doc":  "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


# ─── POST /cv ─────────────────────────────────────────────────────────────────

@router.post("/cv")
async def upload_cv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    if current_user["role"] != "CANDIDATE":
        raise HTTPException(status_code=403, detail="Only candidates can upload CVs")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF, DOC, and DOCX files are allowed")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5 MB")

    os.makedirs(CV_UPLOAD_DIR, exist_ok=True)
    stored_name = f"{uuid.uuid4()}{ext}"          # UUID filename on disk
    disk_path = f"{CV_UPLOAD_DIR}/{stored_name}"  # forward-slash path for disk write

    with open(disk_path, "wb") as f:
        f.write(contents)

    db_file = FileRecord(
        uploaded_by=current_user["user_id"],
        filename=file.filename,    # original browser filename (shown in UI)
        file_path=stored_name,     # ONLY the UUID filename — no directory prefix
        file_type="cv",
        file_size=len(contents),
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    candidate = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == current_user["user_id"]
    ).first()
    if candidate:
        candidate.cv_file_id = db_file.id
        db.commit()

    return {"cv_file_id": db_file.id, "filename": file.filename}


# ─── GET /cv/{file_id} ────────────────────────────────────────────────────────

@router.get("/cv/{file_id}")
async def download_cv(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_info),
):
    file_record = db.query(FileRecord).filter(FileRecord.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    user_id = current_user["user_id"]
    role = current_user["role"]

    if role == "CANDIDATE":
        if file_record.uploaded_by != user_id:
            raise HTTPException(status_code=403, detail="Access denied")

    elif role == "COMPANY":
        company = db.query(CompanyProfile).filter(
            CompanyProfile.user_id == user_id
        ).first()
        if not company:
            raise HTTPException(status_code=403, detail="Access denied")
        # Allow only if the CV belongs to someone who applied to one of this company's jobs
        allowed = (
            db.query(Application)
            .join(JobListing, Application.job_id == JobListing.id)
            .filter(
                JobListing.company_id == company.id,
                Application.cv_file_id == file_id,
            )
            .first()
        )
        if not allowed:
            raise HTTPException(status_code=403, detail="Access denied")

    elif role == "ADMIN":
        pass  # admins can access any file

    else:
        raise HTTPException(status_code=403, detail="Access denied")

    # os.path.basename handles both legacy full-path entries and new UUID-only entries
    disk_path = os.path.join(CV_UPLOAD_DIR, os.path.basename(file_record.file_path))
    if not os.path.exists(disk_path):
        raise HTTPException(status_code=404, detail="File not found on disk")

    ext = os.path.splitext(os.path.basename(file_record.file_path))[1].lower()
    media_type = MIME_TYPES.get(ext, "application/octet-stream")

    return FileResponse(
        path=disk_path,
        filename=file_record.filename,
        media_type=media_type,
    )
