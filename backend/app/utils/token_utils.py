# Utilitete për JWT access token-ët
# Access token-i është i shkurtër (30 min) dhe nuk ruhet në databazë
# Verifikimi bëhet vetëm me çelësin sekret — nuk kërkohet query në databazë
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional
from app.config import JWT_SECRET_KEY, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES


def create_access_token(data: dict) -> str:
    """
    Krijon dhe nënshkruan një JWT access token.
    Payload përfshin: sub (user_id), role, dhe exp (koha e skadimit).
    """
    payload = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload.update({"exp": expire})
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def verify_access_token(token: str) -> Optional[dict]:
    """
    Dekodon dhe verifikon nënshkrimin e access token-it.
    Kthen payload-in (dict) nëse token-i është valid, None nëse ka skaduar ose është i falsifikuar.
    """
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None
