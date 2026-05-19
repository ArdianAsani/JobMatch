# Modeli MLMatchResult — ruan rezultatin e algoritmit ML për çiftin kandidat-punë
# Krijohet kur algoritmi analizon sa mirë përputhet profili i kandidatit me shpalljen
from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, Text, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class MLMatchResult(Base):
    __tablename__ = "ml_match_results"

    id = Column(Integer, primary_key=True, index=True)

    # Çelësat e huaj — tregon cilin kandidat dhe cilin job ka analizuar ML-ja
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_listings.id"), nullable=False)

    # Etiketa e rezultatit të modelit (p.sh. "High Match", "Low Match")
    match_label = Column(String(50), nullable=False)

    # Besueshmëria e modelit në rezultat (0.0000 deri 1.0000)
    confidence = Column(Numeric(5, 4))

    # Inputi dhe outputi i papërpunuar i modelit — ruhen për debug dhe auditim
    model_input = Column(Text)
    model_output = Column(Text)

    # Koha kur u llogarit matching-u
    calculated_at = Column(TIMESTAMP, server_default=func.now())
