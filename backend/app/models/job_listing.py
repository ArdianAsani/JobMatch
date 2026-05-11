from sqlalchemy import Column, Integer, String, Text, Boolean, Numeric, Date, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class JobListing(Base):
    __tablename__ = "job_listings"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("company_profiles.id"), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(Text)
    skills_required = Column(Text)
    job_type = Column(String(100))
    location = Column(String(150))
    salary = Column(Numeric(10, 2))
    is_active = Column(Boolean, default=True)
    deadline = Column(Date)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())