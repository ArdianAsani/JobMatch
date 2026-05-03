from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def create_user(
    db: Session,
    first_name: str,
    last_name: str,
    email: str,
    password_hash: str,
    role_id: int,
) -> User:
    user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        password_hash=password_hash,
        role_id=role_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
