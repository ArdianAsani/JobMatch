"""
Router për ngarkimin e skedarëve (file upload).

Prefix:  /api/upload
Tag:     Upload

Endpoint-et:
  POST /cv  — ngarkon CV-në e kandidatit, ruan në disk dhe databazë,
               dhe cakton cv_file_id tek profili i kandidatit
"""
import os
import uuid
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.file import File as FileRecord
from app.models import CandidateProfile
from app.routes.auth_routes import get_current_user_info

router = APIRouter(prefix="/api/upload", tags=["Upload"])

CV_UPLOAD_DIR = "uploads/cv"
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


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
    unique_name = f"{uuid.uuid4()}{ext}"
    save_path = os.path.join(CV_UPLOAD_DIR, unique_name)

    with open(save_path, "wb") as f:
        f.write(contents)

    db_file = FileRecord(
        uploaded_by=current_user["user_id"],
        filename=file.filename,
        file_path=save_path,
        file_type="cv",
        file_size=len(contents),
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    # Link the uploaded CV to the candidate's profile for auto-attachment on applications
    candidate = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == current_user["user_id"]
    ).first()
    if candidate:
        candidate.cv_file_id = db_file.id
        db.commit()

    return {"cv_file_id": db_file.id, "filename": file.filename}
