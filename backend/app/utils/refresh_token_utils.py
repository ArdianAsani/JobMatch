# Utilitete për refresh token-ët
# Refresh token-i ruhet në databazë dhe ka jetëgjatësi më të gjatë (7 ditë)
# Lejon marrjen e access token-ëve të rinj pa kërkuar login sërisht
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from app.config import REFRESH_TOKEN_EXPIRE_DAYS


def generate_refresh_token() -> str:
    """
    Gjeneron një string të rastit kriptografikisht të sigurt.
    Ky është token-i që i dërgohet klientit — nuk ruhet kurrë i papërpunuar në databazë.
    """
    return secrets.token_urlsafe(64)


def hash_refresh_token(token: str) -> str:
    """
    Krijon hash-in SHA-256 të refresh token-it për ruajtje të sigurt në databazë.
    Kur klienti dërgon token-in, hash-ohet dhe krahason me hash-in e ruajtur.
    """
    return hashlib.sha256(token.encode()).hexdigest()


def get_refresh_token_expiry() -> datetime:
    """Llogarit datën e skadimit për refresh token-in e ri."""
    return datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
