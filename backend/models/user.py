import uuid
import enum
from sqlalchemy import Column, String, Boolean, DateTime, Enum, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from database import Base

class RoleEnum(str, enum.Enum):
    admin = "admin"
    procurement_officer = "procurement_officer"
    vendor = "vendor"
    manager = "manager"

class User(Base):
    __tablename__ = "users"

    # Primary key (your existing UUID choice — good for security)
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Basic identity fields
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, index=True)
    vendor_id = Column(
        UUID(as_uuid=True),
        ForeignKey("vendors.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    is_active = Column(Boolean, default=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())    