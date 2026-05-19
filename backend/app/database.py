# Ky skedar krijon dhe menaxhon lidhjen me databazen përmes SQLAlchemy ORM
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import DATABASE_URL

# Engine është lidhja kryesore me databazen — gjithë queries kalojnë nëpër të
engine = create_engine(DATABASE_URL)

# SessionLocal krijon instanca të sesioneve të databazës
# autocommit=False: ndryshimet nuk ruhen automatikisht — duhet db.commit() manualisht
# autoflush=False: SQLAlchemy nuk dërgon INSERT/UPDATE pa lejë
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base është klasa prind nga e cila trashëgojnë të gjitha modelet (tabelat)
Base = declarative_base()


def get_db():
    """
    Dependency i FastAPI që hap një sesion të databazës për çdo HTTP request
    dhe e mbyll automatikisht pas përfundimit — edhe nëse ndodh gabim.

    Rrjedha:
      1. Hapet sesioni (db = SessionLocal())
      2. Kalohet te route-i nëpërmjet Depends(get_db)
      3. Mbyllet sesioni në finally (pavarësisht nga rezultati)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        # Mbyll lidhjen me databazen pas çdo request-i
        db.close()
