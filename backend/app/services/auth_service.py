from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories import role_repository, user_repository
from app.schemas.auth_schemas import RegisterSchema, LoginSchema
from app.utils.password_utils import hash_password, verify_password
from app.utils.token_utils import create_access_token


def register_user(db: Session, data: RegisterSchema) -> dict:
    if user_repository.get_user_by_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered",
        )

    role = role_repository.get_role_by_name(db, data.role_name.upper())
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role '{data.role_name}' does not exist. Valid roles: ADMIN, COMPANY, CANDIDATE",
        )

    user = user_repository.create_user(
        db=db,
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        password_hash=hash_password(data.password),
        role_id=role.id,
    )

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

    # Use a generic message to avoid leaking whether the email exists
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

    token = create_access_token({"sub": str(user.id), "role": user.role.name})

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role.name,
    }


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
