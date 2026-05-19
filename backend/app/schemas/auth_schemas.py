# Skemat Pydantic për validimin e të dhënave të autentikimit
# Pydantic validon automatikisht request body-n para se të hyjë në route
# Nëse validimi dështon, FastAPI kthen 422 Unprocessable Entity automatikisht
from pydantic import BaseModel, EmailStr, field_validator, model_validator
from datetime import datetime
from typing import Optional
import re

# Vetëm këto role mund të regjistrohen nga publiku — ADMIN krijohet manualisht
ALLOWED_PUBLIC_ROLES = {"CANDIDATE", "COMPANY"}

# Lista e industrive të lejuara për kompanitë
ALLOWED_INDUSTRIES = {
    "Technology", "Finance", "Healthcare", "Education", "Marketing",
    "E-Commerce", "Manufacturing", "Real Estate", "Media", "Consulting",
    "Telecommunications", "Transportation", "Hospitality", "Other",
}


def _normalize_url(url: str) -> str:
    """Auto-prepend https:// if missing, then validate URL shape."""
    url = url.strip()
    if not re.match(r"^https?://", url, re.IGNORECASE):
        url = "https://" + url
    pattern = re.compile(
        r"^https?://"
        r"(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?"
        r"(?::\d+)?(?:/.*)?$",
        re.IGNORECASE,
    )
    if not pattern.match(url):
        raise ValueError("Please enter a valid website URL (e.g. https://company.com)")
    return url


class RegisterSchema(BaseModel):
    """Schema e regjistrimit — validon të dhënat nga frontend-i para krijimit të user-it."""
    name: str
    email: EmailStr
    password: str
    role_name: str
    # Company-specific fields — optional at schema level, enforced by model_validator
    industry: Optional[str] = None
    custom_industry: Optional[str] = None
    website: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_required(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name is required")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    # Parandalon regjistrimin me role si ADMIN nëpërmjet API-t publike
    @field_validator("role_name")
    @classmethod
    def role_must_be_allowed(cls, v: str) -> str:
        upper = v.upper()
        if upper not in ALLOWED_PUBLIC_ROLES:
            raise ValueError("Role must be CANDIDATE or COMPANY")
        return upper

    @model_validator(mode="after")
    def validate_company_fields(self) -> "RegisterSchema":
        """Company-specific cross-field validation runs after all fields are set."""
        if self.role_name != "COMPANY":
            return self

        if not self.industry or not self.industry.strip():
            raise ValueError("Industry is required for company registration")

        if self.industry not in ALLOWED_INDUSTRIES:
            raise ValueError("Invalid industry selection")

        if self.industry == "Other":
            if not self.custom_industry or not self.custom_industry.strip():
                raise ValueError("Please specify your industry")
            self.custom_industry = self.custom_industry.strip()

        if self.website and self.website.strip():
            self.website = _normalize_url(self.website)
        else:
            self.website = None

        return self


class LoginSchema(BaseModel):
    """Schema e login-it — vetëm email dhe fjalëkalimi."""
    email: EmailStr
    password: str


class RefreshRequestSchema(BaseModel):
    """Klienti dërgon refresh token-in për të marrë access token të ri."""
    refresh_token: str


class LogoutRequestSchema(BaseModel):
    """Klienti dërgon refresh token-in për ta anuluar gjatë logout-it."""
    refresh_token: str


class UserResponseSchema(BaseModel):
    """Përgjigja standarde me të dhënat bazë të user-it."""
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponseSchema(BaseModel):
    """Përgjigja pas login-it të suksesshëm — kthen të dy token-ët."""
    access_token: str
    refresh_token: str
    token_type: str
    role: str


class AccessTokenResponseSchema(BaseModel):
    """Përgjigja pas rinovimit të access token-it — vetëm access token i ri."""
    access_token: str
    token_type: str


class MessageSchema(BaseModel):
    """Përgjigje e thjeshtë me mesazh — përdoret për logout dhe operacione të ngjashme."""
    message: str
