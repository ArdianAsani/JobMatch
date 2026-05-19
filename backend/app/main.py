# Pika kryesore e nisjes së aplikacionit FastAPI
# Këtu konfigurohet middleware-i, regjistrohen route-t dhe inicializohet databaza
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.models import Role, User  # noqa: F401 — registers models with Base
from app.routes.auth_routes import router as auth_router
from app.routes.dashboards import router as dashboard_router
from app.routes.admin_routes import router as admin_router
from app.repositories import role_repository

# Krijon instancën kryesore të aplikacionit FastAPI
app = FastAPI(title="JobMatch API")

# Lista e origjinave të lejuara për CORS (frontend React në dev mode)
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

# CORS Middleware lejon frontend-in të komunikojë me backend-in nga domene të ndryshme
# Pa këtë, browseri do të bllokonte çdo request nga React te FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create all tables defined in SQLAlchemy models
Base.metadata.create_all(bind=engine)


def seed_roles():
    """
    Shton rolet bazë në databazë nëse nuk ekzistojnë ende.
    Kjo ekzekutohet automatikisht kur starton serveri.
    Pa rolet ADMIN, COMPANY, CANDIDATE — sistemi nuk mund të regjistrojë përdorues.
    """
    db = SessionLocal()
    try:
        # Rolet e përcaktuara në dokumentacion
        for name in ["ADMIN", "COMPANY", "CANDIDATE"]:
            if not role_repository.get_role_by_name(db, name):
                role_repository.create_role(db, name)
    finally:
        db.close()


# Ekzekutohet menjëherë kur starton serveri
seed_roles()

# Regjistron route-t e aplikacionit — çdo router ka prefix-in e vet
app.include_router(auth_router)       # /auth/...
app.include_router(dashboard_router)  # /api/dashboard/...
app.include_router(admin_router)      # /api/admin/...


@app.get("/")
def root():
    return {"message": "JobMatch Backend is running"}


@app.get("/test-db")
def test_db():
    try:
        with engine.connect() as connection:
            return {"message": "Database connection successful"}
    except Exception as e:
        return {"error": str(e)}
