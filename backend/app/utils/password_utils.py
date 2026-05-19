# Utilitete për menaxhimin e fjalëkalimeve
# Përdoret algoritmi bcrypt — i sigurt kundër sulmeve brute-force dhe rainbow table
from passlib.context import CryptContext

# Konfigurimi i bcrypt si algoritmi i vetëm i lejuar për hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Krijon hash-in bcrypt të fjalëkalimit.
    Rezultati është i ndryshëm çdo herë (salt automatik) — kjo është e dëshirueshme.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Krahason fjalëkalimin e dhënë me hash-in e ruajtur në databazë.
    Kthen True nëse përputhen, False nëse jo.
    """
    return pwd_context.verify(plain_password, hashed_password)
