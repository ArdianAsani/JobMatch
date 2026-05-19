# Modeli RefreshToken — ruan refresh token-ët aktive në databazë
# Refresh token-i lejon rinovimin e access token-it pa loginim të ri
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)

    # Çelës i huaj — tregon cilit user i përket ky token
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Ruhet vetëm hash-i SHA-256 i token-it — jo vlera origjinale
    # Kjo mbron sigurinë: edhe nëse databaza ekspozohet, token-ët nuk mund të përdoren
    token_hash = Column(String(255), nullable=False, index=True)

    # Data e skadimit — pas kësaj date token-i refuzohet automatikisht
    expires_at = Column(DateTime(timezone=True), nullable=False)

    # revoked_at=NULL: token-i është aktiv
    # revoked_at=<data>: token-i është anuluar (logout ose admin action)
    revoked_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relacioni ORM — lejon aksesin si token.user
    user = relationship("User")
