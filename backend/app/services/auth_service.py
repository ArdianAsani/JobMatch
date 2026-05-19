# Shërbimi kryesor i autentikimit — logjika e biznesit për regjistrim, login, dhe token-ët
# Shtresa service ndodhet midis route-ve (HTTP) dhe repository-ve (databaza)
# Route-t thërrasin service-in, service-i thërret repository-n
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
    """
    Regjistron një përdorues të ri.

    Rrjedha:
      1. Kontrollon nëse email-i ekziston tashmë
      2. Verifikon që roli i kërkuar ekziston
      3. Krijon User-in (me flush — pa commit)
      4. Krijon profilin sipas rolit (CompanyProfile ose CandidateProfile)
      5. Kryen commit-in atomik — të dy rekordet ruhen ose asnjë

    FIX: Përdorimi i db.flush() + commit të vetëm mbron kundër user-ëve "jetimë"
    pa profil nëse krijoni dështon pas ruajtjes së user-it.
    """
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

    # create_user() uses db.flush() internally — the User row is sent to the DB
    # and gets its auto-generated id, but the transaction is not committed yet.
    #
    # The caller (auth_service.register_user) is responsible for calling db.commit()
    # once the full operation (user + role-specific profile) is complete.
    # This ensures both records are committed atomically: if profile creation fails,
    # the entire transaction is rolled back and no orphaned user row is left behind.
    user = user_repository.create_user(
        db=db,
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role_id=role.id,
    )

    # Stage the role-specific profile in the same transaction.
    # user.id is available now (assigned by the flush above).
    if role.name == "COMPANY":
        # user.name holds the company name directly — no more first_name workaround.
        # When industry == "Other", use the user's free-text value from custom_industry.
        effective_industry = (
            data.custom_industry.strip() if data.industry == "Other" else data.industry
        )
        db.add(CompanyProfile(
            user_id=user.id,
            company_name=user.name,
            industry=effective_industry,
            website=data.website,   # already normalized by schema; None when no website
            is_approved=False,
        ))
    elif role.name == "CANDIDATE":
        db.add(CandidateProfile(user_id=user.id))

    # Single commit — User and Profile are persisted atomically.
    # If anything raises before this point the transaction has not been committed,
    # so get_db()'s finally block (db.close()) will roll back both the user
    # and the profile insert — no orphaned rows.
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": role.name,
        "is_active": user.is_active,
        "created_at": user.created_at,
    }


def login_user(db: Session, data: LoginSchema) -> dict:
    """
    Autentikon përdoruesin dhe lëshon access + refresh token.

    Rrjedha:
      1. Kërkon user-in sipas email-it
      2. Verifikon fjalëkalimin me bcrypt
      3. Kontrollon nëse llogaria është aktive
      4. Krijon access token (JWT, jetëshkurtër)
      5. Krijon refresh token (i gjatë, ruhet i hash-uar në databazë)

    FIX: Mesazhi i gabimit është i njëjtë për email jo ekzistues dhe fjalëkalim gabim
    — kjo mbron kundër sulme që zbulojnë nëse një email ekziston në sistem.
    """
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

    # Krijon access token me sub=user_id dhe role — dekodon nga JWT pa query DB
    access_token = create_access_token({"sub": str(user.id), "role": user.role.name})

    # Gjeneron refresh token, hash-on dhe ruan vetëm hash-in
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
    """
    Lëshon një access token të ri duke përdorur refresh token-in.

    Rrjedha e validimit:
      1. Hash-on token-in e marrë dhe kërkon në databazë
      2. Kontrollon nëse token-i ekziston
      3. Kontrollon nëse token-i është anuluar (revoked)
      4. Kontrollon nëse token-i ka skaduar
      5. Kontrollon nëse llogaria e user-it është ende aktive
      6. Krijon dhe kthen access token të ri

    FIX: timezone-awareness — expires_at nga databaza mund të jetë pa tzinfo;
    shtohet UTC manualisht para krahasimit për të shmangur TypeError.
    """
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
    """
    Anullon refresh token-in e dhënë — seansi i përdoruesit bëhet invalid.
    Nëse token-i nuk gjendet ose është tashmë i anuluar, nuk ndodh gabim.
    Kjo bën logout-in idempotent dhe të sigurt.
    """
    token_hash = hash_refresh_token(raw_token)
    stored = refresh_token_repository.get_by_hash(db, token_hash)

    if stored and stored.revoked_at is None:
        refresh_token_repository.revoke(db, stored)

    return {"message": "Logged out successfully"}


def get_current_user_profile(db: Session, user_id: int) -> dict:
    """Kthen profilin bazë të user-it aktiv. Përdoret nga endpoint-i /auth/me."""
    user = user_repository.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.name,
        "is_active": user.is_active,
        "created_at": user.created_at,
    }
