# Modeli CompanyProfile — ruhet profili i kompanisë pas regjistrimit
# Lidhet me User nëpërmjet user_id (one-to-one: çdo kompani ka saktësisht një user)
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class CompanyProfile(Base):
    __tablename__ = "company_profiles"

    id = Column(Integer, primary_key=True, index=True)

    # Lidhja me tabelën users — unique: një user mund të ketë vetëm një profil kompanie
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    company_name = Column(String(150), nullable=False)
    industry = Column(String(100))
    description = Column(Text)
    website = Column(String(255))

    # Referenca opsionale tek skedari i logos së kompanisë
    logo_file_id = Column(Integer, ForeignKey("files.id"), nullable=True)

    company_size = Column(String(100), nullable=True)
    founded_year = Column(String(10), nullable=True)
    hq_location = Column(String(200), nullable=True)

    # is_approved=False: kompania pret miratimin e adminit para se të postojë punë
    # Ndryshon në True vetëm kur admini e miraton manualisht
    is_approved = Column(Boolean, default=False)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
