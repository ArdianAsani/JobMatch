# Repository për modelin User
# Shtresa repository izoleon logjikën e databazës nga shërbimi (service)
# Të gjitha queries mbi tabelën "users" bëhen këtu
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Kërkon një user sipas email-it. Përdoret gjatë login-it dhe regjistrimit."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Kërkon një user sipas ID-së. Përdoret kur verifikohet JWT token-i."""
    return db.query(User).filter(User.id == user_id).first()


def create_user(
    db: Session,
    name: str,
    email: str,
    password_hash: str,
    role_id: int,
) -> User:
    """
    Krijon një user të ri brenda transaksionit aktiv.

    Përdor db.flush() — jo db.commit() — që user-i dhe profili i tij
    (CompanyProfile ose CandidateProfile) të ruhen atomikisht nga auth_service.
    Nëse krijoni profilin dështon, asnjë rekord nuk mbetet në databazë.
    """
    user = User(
        name=name,
        email=email,
        password_hash=password_hash,
        role_id=role_id,
    )
    db.add(user)

    # flush() sends the INSERT to the database within the current open transaction
    # so the DB assigns user.id via autoincrement — but does NOT commit yet.
    #
    # The caller (auth_service.register_user) is responsible for calling db.commit()
    # once the full operation (user + role-specific profile) is complete.
    # This ensures both records are committed atomically: if profile creation fails,
    # the entire transaction is rolled back and no orphaned user row is left behind.
    db.flush()

    # refresh() runs a SELECT on the same open connection to load all
    # server-generated column values (id, created_at, updated_at).
    db.refresh(user)
    return user
