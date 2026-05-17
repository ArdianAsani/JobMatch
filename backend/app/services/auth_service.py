from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories import role_repository, user_repository, refresh_token_repository
from app.schemas.auth_schemas import RegisterSchema, LoginSchema
from app.utils.password_utils import hash_password, verify_password
from app.models.company_profile import CompanyProfile
from app.models.candidate_profile import CandidateProfile
from app.utils.token_utils import create_access_token
from app.utils.refresh_token_utils import (
    generate_refresh_token,
    hash_refresh_token,
    get_refresh_token_expiry,
)


def register_user(db: Session, data: RegisterSchema) -> dict:
    if user_repository.get_user_by_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered",
        )

    role = role_repository.get_role_by_name(db, data.role_name)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role '{data.role_name}' does not exist",
        )

    user = user_repository.create_user(
        db=db,
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        password_hash=hash_password(data.password),
        role_id=role.id,
    )

    if role.name == "COMPANY":
        # first_name carries the company name (set by the registration form)
        db.add(CompanyProfile(user_id=user.id, company_name=user.first_name, is_approved=False))
        db.commit()
    elif role.name == "CANDIDATE":
        db.add(CandidateProfile(user_id=user.id))
        db.commit()

    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": role.name,
        "is_active": user.is_active,
        "created_at": user.created_at,
    }


def login_user(db: Session, data: LoginSchema) -> dict:
    user = user_repository.get_user_by_email(db, data.email)

    # Generic message to avoid leaking whether the email exists
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    access_token = create_access_token({"sub": str(user.id), "role": user.role.name})

    raw_refresh_token = generate_refresh_token()
    refresh_token_repository.create_refresh_token(
        db=db,
        user_id=user.id,
        token_hash=hash_refresh_token(raw_refresh_token),
        expires_at=get_refresh_token_expiry(),
    )

    return {
        "access_token": access_token,
        "refresh_token": raw_refresh_token,
        "token_type": "bearer",
        "role": user.role.name,
    }


def refresh_access_token(db: Session, raw_token: str) -> dict:
    token_hash = hash_refresh_token(raw_token)
    stored = refresh_token_repository.get_by_hash(db, token_hash)

    if not stored:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    if stored.revoked_at is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked",
        )

    now = datetime.now(timezone.utc)
    expires_at = stored.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if now > expires_at:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired",
        )

    user = user_repository.get_user_by_id(db, stored.user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    new_access_token = create_access_token({"sub": str(user.id), "role": user.role.name})

    return {"access_token": new_access_token, "token_type": "bearer"}


def logout_user(db: Session, raw_token: str) -> dict:
    token_hash = hash_refresh_token(raw_token)
    stored = refresh_token_repository.get_by_hash(db, token_hash)

    if stored and stored.revoked_at is None:
        refresh_token_repository.revoke(db, stored)

    return {"message": "Logged out successfully"}


def get_current_user_profile(db: Session, user_id: int) -> dict:
    user = user_repository.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": user.role.name,
        "is_active": user.is_active,
        "created_at": user.created_at,
    }
