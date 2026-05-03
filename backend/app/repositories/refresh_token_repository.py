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
    return db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()


def revoke(db: Session, token: RefreshToken) -> None:
    token.revoked_at = datetime.now(timezone.utc)
    db.commit()
