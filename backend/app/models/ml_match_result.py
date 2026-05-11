from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, Text, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class MLMatchResult(Base):
    __tablename__ = "ml_match_results"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_listings.id"), nullable=False)
    match_label = Column(String(50), nullable=False)
    confidence = Column(Numeric(5, 4))
    model_input = Column(Text)
    model_output = Column(Text)
    calculated_at = Column(TIMESTAMP, server_default=func.now())