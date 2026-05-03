from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime

ALLOWED_PUBLIC_ROLES = {"CANDIDATE", "COMPANY"}


class RegisterSchema(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    role_name: str

    @field_validator("first_name")
    @classmethod
    def first_name_required(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("First name is required")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("role_name")
    @classmethod
    def role_must_be_allowed(cls, v: str) -> str:
        upper = v.upper()
        if upper not in ALLOWED_PUBLIC_ROLES:
            raise ValueError("Role must be CANDIDATE or COMPANY")
        return upper


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class RefreshRequestSchema(BaseModel):
    refresh_token: str


class LogoutRequestSchema(BaseModel):
    refresh_token: str


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
    refresh_token: str
    token_type: str
    role: str


class AccessTokenResponseSchema(BaseModel):
    access_token: str
    token_type: str


class MessageSchema(BaseModel):
    message: str
