from pydantic import BaseModel, EmailStr
from core.enums import RoleEnum
from schemas.user import UserOut

from typing import Optional
from uuid import UUID

class SignupRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    phone_number: Optional[str] = ""
    role: str
    country: Optional[str] = ""
    additional_info: Optional[str] = ""
    photo_url: Optional[str] = ""
    vendor_id: Optional[UUID] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: UserOut

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
