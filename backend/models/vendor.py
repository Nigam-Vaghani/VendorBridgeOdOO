import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Enum, Text, Integer, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
from core.enums import VendorStatus

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    gst_number = Column(String(50), unique=True, nullable=True)
    pan_number = Column(String(20), unique=True, nullable=True)
    contact_person = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=False)
    website = Column(String(500), nullable=True)
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(20), nullable=True)
    country = Column(String(100), nullable=False, default="India")
    status = Column(Enum(VendorStatus), nullable=False, default=VendorStatus.active, index=True)
    rating = Column(Numeric(3, 2), nullable=False, default=0.00)
    total_orders = Column(Integer, nullable=False, default=0)
    on_time_delivery_pct = Column(Numeric(5, 2), nullable=False, default=0.00)
    registered_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    documents = relationship("VendorDocument", backref="vendor", lazy="select", cascade="all, delete-orphan")
