# Modeli JobListing — përfaqëson një shpallje pune të postuar nga një kompani
from sqlalchemy import Column, Integer, String, Text, Boolean, Numeric, Date, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class JobListing(Base):
    __tablename__ = "job_listings"

    id = Column(Integer, primary_key=True, index=True)

    # Çelës i huaj — lidh shpalljen me profilin e kompanisë që e ka postuar
    company_id = Column(Integer, ForeignKey("company_profiles.id"), nullable=False)

    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(Text)

    # Aftësitë e kërkuara — përdoren nga algoritmi ML për matching me kandidatët
    skills_required = Column(Text)

    # Lloji i punës: "Full-time", "Part-time", "Remote", etj.
    job_type = Column(String(100))

    location = Column(String(150))

    # Paga opsionale — tip Numeric për saktësi monetare (pa gabime float)
    salary = Column(Numeric(10, 2))

    # is_active=False: shpallja është joaktive dhe NUK pranon aplikime të reja
    # Admini mund ta çaktivizojë çdo shpallje — kandidatët nuk e shohin më
    is_active = Column(Boolean, default=True)

    # Data e fundit e pranimit të aplikimeve
    deadline = Column(Date)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
