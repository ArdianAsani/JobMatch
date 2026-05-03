from pydantic import BaseModel, EmailStr
from datetime import datetime


class RegisterSchema(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    role_name: str  # Must be one of: ADMIN, COMPANY, CANDIDATE


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class UserResponseSchema(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponseSchema(BaseModel):
    access_token: str
    token_type: str
    role: str
