# Modeli User — përfaqëson tabelën "users" në databazë
# Çdo person që regjistrohet (kompani, kandidat, admin) ruan kredencialet këtu
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Çelës i huaj — lidh përdoruesin me tabelën "roles"
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)

    name = Column(String(200), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)

    # Fjalëkalimi ruhet i hashuar me bcrypt — KURRË nuk ruhet si tekst i qartë
    password_hash = Column(String(255), nullable=False)

    # is_active=False përdoret për deaktivizimin e llogarisë (p.sh. pas refuzimit të kompanisë)
    # Pa fshirë rekordin — historiku ruhet për auditim
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relacioni ORM — lejon aksesin si user.role pa query shtesë
    role = relationship("Role")
