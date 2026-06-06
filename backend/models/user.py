import uuid
import enum
from sqlalchemy import Column, String, Boolean, DateTime, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from ..database import Base

class RoleEnum(str, enum.Enum):
    admin = "admin"
    procurement_officer = "procurement_officer"
    vendor = "vendor"
    manager = "manager"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone_number = Column(String(20), nullable=True)
    country = Column(String(100), nullable=True)
    additional_info = Column(Text, nullable=True)
    photo_url = Column(String(255), nullable=True)
    password_hash = Column(Text, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
