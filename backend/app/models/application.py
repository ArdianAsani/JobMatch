from sqlalchemy import Column, Integer, Enum, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_listings.id"), nullable=False)
    cv_file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    cover_letter_file_id = Column(Integer, ForeignKey("files.id"), nullable=True)
    status = Column(Enum('Pending', 'Under Review', 'Interview', 'Accepted', 'Rejected'), default='Pending')
    applied_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())