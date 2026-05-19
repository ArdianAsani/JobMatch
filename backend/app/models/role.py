# Modeli Role — përfaqëson tabelën "roles" në databazë
# Çdo përdorues ka saktësisht një rol: ADMIN, COMPANY ose CANDIDATE
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)  # ADMIN, COMPANY, CANDIDATE
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
