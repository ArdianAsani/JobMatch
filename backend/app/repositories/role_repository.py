from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.role import Role


def get_role_by_name(db: Session, name: str) -> Optional[Role]:
    return db.query(Role).filter(Role.name == name).first()


def get_all_roles(db: Session) -> List[Role]:
    return db.query(Role).all()


def create_role(db: Session, name: str) -> Role:
    role = Role(name=name)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role
