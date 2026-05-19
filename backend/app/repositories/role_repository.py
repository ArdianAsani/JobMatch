# Repository për modelin Role
# Shtresa repository izoleon logjikën e databazës nga shërbimi (service)
# Të gjitha queries mbi tabelën "roles" bëhen këtu
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.role import Role


def get_role_by_name(db: Session, name: str) -> Optional[Role]:
    """Kërkon një rol sipas emrit (p.sh. 'ADMIN'). Kthen None nëse nuk gjendet."""
    return db.query(Role).filter(Role.name == name).first()


def get_all_roles(db: Session) -> List[Role]:
    """Kthen të gjitha rolet nga databaza."""
    return db.query(Role).all()


def create_role(db: Session, name: str) -> Role:
    """Shton një rol të ri në databazë dhe e ruan menjëherë."""
    role = Role(name=name)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role
