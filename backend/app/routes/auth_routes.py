from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth_schemas import RegisterSchema, LoginSchema, UserResponseSchema, TokenResponseSchema
from app.services import auth_service
from app.utils.token_utils import verify_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

# tokenUrl points to /auth/token so Swagger Authorize sends form-data there
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_current_user_id(token: str = Depends(oauth2_scheme)) -> int:
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return int(payload["sub"])


@router.post("/register", response_model=UserResponseSchema, status_code=status.HTTP_201_CREATED)
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    return auth_service.register_user(db, data)


@router.post("/login", response_model=TokenResponseSchema)
def login(data: LoginSchema, db: Session = Depends(get_db)):
    """Frontend login — accepts JSON body with email and password."""
    return auth_service.login_user(db, data)


@router.post("/token", response_model=TokenResponseSchema, include_in_schema=False)
def token(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Swagger OAuth2 login — accepts form-data; username field is treated as email."""
    data = LoginSchema(email=form.username, password=form.password)
    return auth_service.login_user(db, data)


@router.get("/me", response_model=UserResponseSchema)
def me(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return auth_service.get_current_user_profile(db, user_id)
