# Modeli File — ruan metadata-n e skedarëve të ngarkuar (CV, letër motivuese, logo)
# Skedari fizik ruhet në disk; ky model ruan informacionin rreth tij në databazë
from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)

    # Çelës i huaj — kush e ka ngarkuar skedarin
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Emri origjinal i skedarit siç u ngarkua nga përdoruesi
    filename = Column(String(255), nullable=False)

    # Rruga në server ku ruhet skedari fizikisht (p.sh. app/uploads/cvs/file.pdf)
    file_path = Column(String(500), nullable=False)

    # Lloji i skedarit: "cv", "cover_letter", "logo"
    file_type = Column(String(50), nullable=False)

    # Madhësia e skedarit në bytes — opsionale
    file_size = Column(Integer, nullable=True)

    created_at = Column(TIMESTAMP, server_default=func.now())
