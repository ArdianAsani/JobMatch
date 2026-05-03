import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from app.config import REFRESH_TOKEN_EXPIRE_DAYS


def generate_refresh_token() -> str:
    """Return a cryptographically secure random URL-safe string."""
    return secrets.token_urlsafe(64)


def hash_refresh_token(token: str) -> str:
    """SHA-256 hash a raw refresh token for safe storage in the database."""
    return hashlib.sha256(token.encode()).hexdigest()


def get_refresh_token_expiry() -> datetime:
    """Return the expiry datetime for a new refresh token."""
    return datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
