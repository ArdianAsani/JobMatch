from pydantic import BaseModel, EmailStr, field_validator, model_validator
from datetime import datetime
from typing import Optional
import re

ALLOWED_PUBLIC_ROLES = {"CANDIDATE", "COMPANY"}

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
    # Single name field: candidates send their full name, companies send their company name.
    # Eliminates the old first_name / last_name split and the last_name="" company workaround.
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
    email: EmailStr
    password: str


class RefreshRequestSchema(BaseModel):
    refresh_token: str


class LogoutRequestSchema(BaseModel):
    refresh_token: str


class UserResponseSchema(BaseModel):
    id: int
    name: str
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
