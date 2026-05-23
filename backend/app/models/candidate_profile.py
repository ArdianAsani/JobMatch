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

    # Përshkrim profesional — fusha kryesore për SBERT semantic matching
    professional_summary = Column(Text)

    # Aftësitë teknike/profesionale të kandidatit (ruhen si tekst)
    skills = Column(Text)

    # Niveli i përvojës (p.sh. "Junior", "Mid-level", "Senior")
    experience_level = Column(String(100))

    # Kontakti
    phone = Column(String(50))
    location = Column(String(200))
    linkedin_url = Column(String(300))

    # FK to files.id — set after candidate uploads a CV; auto-attached to new applications
    cv_file_id = Column(Integer, ForeignKey("files.id"), nullable=True)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
