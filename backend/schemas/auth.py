from pydantic import BaseModel, EmailStr
from typing import Optional
from ..models.user import RoleEnum
from .user import UserOut

class SignupRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    phone_number: Optional[str] = None
    country: Optional[str] = None
    additional_info: Optional[str] = None
    photo_url: Optional[str] = None
    role: RoleEnum

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
