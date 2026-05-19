# Repository për modelin RefreshToken
# Menaxhon krijimin, kërkimin dhe anulimin e refresh token-ëve në databazë
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.refresh_token import RefreshToken


def create_refresh_token(
    db: Session,
    user_id: int,
    token_hash: str,
    expires_at: datetime,
) -> RefreshToken:
    """
    Ruan një refresh token të ri në databazë pas login-it të suksesshëm.
    Ruhet vetëm hash-i — jo token-i origjinal — për siguri.
    """
    token = RefreshToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    return token


def get_by_hash(db: Session, token_hash: str) -> Optional[RefreshToken]:
    """Kërkon një refresh token sipas hash-it të tij. Përdoret gjatë rinovimit të access token-it."""
    return db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()


def revoke(db: Session, token: RefreshToken) -> None:
    """
    Anulon një refresh token duke vendosur revoked_at me kohën aktuale.
    Token-i mbetet në databazë por nuk pranohet më për rinovimdhe as logout.
    """
    token.revoked_at = datetime.now(timezone.utc)
    db.commit()
