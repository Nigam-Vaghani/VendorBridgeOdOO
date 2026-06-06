from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID
from core.enums import RoleEnum

class UserOut(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: Optional[str] = None
    role: str
    country: Optional[str] = None
    additional_info: Optional[str] = None
    photo_url: Optional[str] = None
    vendor_id: Optional[UUID] = None
    is_active: bool = True
    last_login_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    role: Optional[RoleEnum] = None
    country: Optional[str] = None
    additional_info: Optional[str] = None
    is_active: Optional[bool] = None
