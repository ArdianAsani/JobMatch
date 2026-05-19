# Modeli Application — përfaqëson aplikimin e një kandidati për një vend pune
# Krijohet kur kandidati klikon "Apply" për një shpallje aktive
from sqlalchemy import Column, Integer, Enum, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)

    # Çelës i huaj — kandidati që aplikoi
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False)

    # Çelës i huaj — shpallja pune për të cilën u aplikua
    job_id = Column(Integer, ForeignKey("job_listings.id"), nullable=False)

    # Skedarë opsionalë të ngarkuar gjatë aplikimit
    cv_file_id = Column(Integer, ForeignKey("files.id"), nullable=True)
    cover_letter_file_id = Column(Integer, ForeignKey("files.id"), nullable=True)

    # Statusi aktual i aplikimit — ndryshon nga kompania gjatë procesit të rekrutimit:
    # Pending → Under Review → Interview → Accepted / Rejected
    status = Column(Enum('Pending', 'Under Review', 'Interview', 'Accepted', 'Rejected'), default='Pending')

    applied_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
