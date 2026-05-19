# Modeli CandidateProfile — ruhet profili profesional i kandidatit
# Krijohet automatikisht bosh gjatë regjistrimit — kandidati e plotëson më vonë
from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(Integer, primary_key=True, index=True)

    # Lidhja me tabelën users — unique: çdo kandidat ka vetëm një profil
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Titulli i shkurtër profesional (p.sh. "Software Engineer")
    headline = Column(String(255))

    # Përshkrim i shkurtër mbi kandidatin
    summary = Column(Text)

    # Aftësitë teknike/profesionale të kandidatit (ruhen si tekst)
    skills = Column(Text)

    # Niveli i përvojës (p.sh. "Junior", "Mid-level", "Senior")
    experience_level = Column(String(100))

    education = Column(Text)

    # Teksti i CV-së i ngarkuar — mund të përdoret nga algoritmi ML për matching
    resume_text = Column(Text)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
