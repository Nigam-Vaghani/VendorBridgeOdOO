from pydantic import BaseModel, EmailStr
from models.user import RoleEnum
from schemas.user import UserOut

from typing import Optional
from uuid import UUID

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: RoleEnum
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
