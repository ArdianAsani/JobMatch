from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.models import Role, User  # noqa: F401 — registers models with Base
from app.routes.auth_routes import router as auth_router
from app.routes.dashboards import router as dashboard_router
from app.routes.admin_routes import router as admin_router
from app.repositories import role_repository

app = FastAPI(title="JobMatch API")

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Vite standard port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create all tables defined in SQLAlchemy models
Base.metadata.create_all(bind=engine)


def seed_roles():
    """Insert default roles if they do not already exist."""
    db = SessionLocal()
    try:
        # Rolet e përcaktuara në dokumentacion [cite: 171, 323]
        for name in ["ADMIN", "COMPANY", "CANDIDATE"]:
            if not role_repository.get_role_by_name(db, name):
                role_repository.create_role(db, name)
    finally:
        db.close()


seed_roles()

# Routers
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(admin_router)


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