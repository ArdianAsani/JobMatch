# Route-t e autentikimit — të gjitha endpoint-et nën /auth/...
# Ky skedar gjithashtu eksporton dependency-et e autentikimit (get_current_user_id, get_current_user_info)
# që përdoren nga route-t e tjera për të mbrojtur endpoint-et e tyre
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth_schemas import (
    RegisterSchema,
    LoginSchema,
    RefreshRequestSchema,
    LogoutRequestSchema,
    UserResponseSchema,
    TokenResponseSchema,
    AccessTokenResponseSchema,
    MessageSchema,
)
from app.services import auth_service
from app.utils.token_utils import verify_access_token

# Prefiks /auth dhe tag Authentication për grupim në dokumentacionin Swagger
router = APIRouter(prefix="/auth", tags=["Authentication"])

# tokenUrl points to /auth/token so Swagger Authorize sends form-data there
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_current_user_id(token: str = Depends(oauth2_scheme)) -> int:
    """
    Dependency i FastAPI — ekstrakton user_id nga JWT token-i.
    Injektohet automatikisht në çdo route me Depends(get_current_user_id).
    Hedh 401 nëse token-i mungon, ka skaduar ose është i falsifikuar.
    """
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return int(payload["sub"])


def get_current_user_info(token: str = Depends(oauth2_scheme)) -> dict:
    """Returns {"user_id": int, "role": str} extracted from the JWT.
    Used by dashboard routes that need both identity and role for authorization."""
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"user_id": int(payload["sub"]), "role": payload.get("role", "")}


# Endpoint-i publik i regjistrimit — nuk kërkon token
@router.post("/register", response_model=UserResponseSchema, status_code=status.HTTP_201_CREATED)
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    return auth_service.register_user(db, data)


# Endpoint-i i login-it — pranon JSON; kthen access + refresh token
@router.post("/login", response_model=TokenResponseSchema)
def login(data: LoginSchema, db: Session = Depends(get_db)):
    """Frontend login — accepts JSON body with email and password."""
    return auth_service.login_user(db, data)


# Endpoint-i i login-it për Swagger UI — pranon form-data
@router.post("/token", response_model=TokenResponseSchema, include_in_schema=False)
def token(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Swagger OAuth2 login — accepts form-data; username field is treated as email."""
    data = LoginSchema(email=form.username, password=form.password)
    return auth_service.login_user(db, data)


# Rinovon access token-in duke përdorur refresh token-in — nuk kërkon login sërisht
@router.post("/refresh", response_model=AccessTokenResponseSchema)
def refresh(data: RefreshRequestSchema, db: Session = Depends(get_db)):
    """Issue a new access token using a valid refresh token."""
    return auth_service.refresh_access_token(db, data.refresh_token)


# Anulon refresh token-in — seansi bëhet invalid (logout)
@router.post("/logout", response_model=MessageSchema)
def logout(data: LogoutRequestSchema, db: Session = Depends(get_db)):
    """Revoke a refresh token and invalidate the session."""
    return auth_service.logout_user(db, data.refresh_token)


# Endpoint i mbrojtur — kthen profilin e user-it aktual nga JWT
@router.get("/me", response_model=UserResponseSchema)
def me(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return auth_service.get_current_user_profile(db, user_id)
