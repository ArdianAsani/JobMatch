from sqlalchemy import Column, Integer, ForeignKey, TIMESTAMP, UniqueConstraint
from sqlalchemy.sql import func
from app.database import Base


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_listings.id"), nullable=False)
    saved_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("candidate_id", "job_id", name="uq_saved_job"),
    )
