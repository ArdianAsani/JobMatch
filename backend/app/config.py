# Lexon variablat e mjedisit nga skedari .env
# Kjo është e rëndësishme: çelësat sekretë nuk duhet të shkruhen drejtpërdrejt në kod
from dotenv import load_dotenv
import os

# Ngarkon skedarin .env në memorie — duhet të ekzekutohet para çdo os.getenv()
load_dotenv()

# URL e lidhjes me databazen (p.sh. postgresql://user:pass@localhost/dbname)
DATABASE_URL = os.getenv("DATABASE_URL")

# Çelësi sekret për nënshkrimin e JWT tokenave — KURRË mos e ekspono publikisht
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

# Algoritmi i enkriptimit për JWT (default: HS256 — HMAC me SHA-256)
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

# Koha e skadimit të access token-it në minuta (default: 30 minuta)
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30)
)

# Koha e skadimit të refresh token-it në ditë (default: 7 ditë)
REFRESH_TOKEN_EXPIRE_DAYS = int(
    os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7)
)
