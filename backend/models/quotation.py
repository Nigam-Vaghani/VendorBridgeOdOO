import uuid
from sqlalchemy import Column, String, Text, DateTime, Enum, Numeric, SmallInteger, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
from core.enums import QuotationStatus

class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rfq_id = Column(UUID(as_uuid=True), ForeignKey("rfqs.id", ondelete="CASCADE"), nullable=False)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False)
    delivery_days = Column(SmallInteger, nullable=False)
    validity_days = Column(SmallInteger, nullable=False, default=30)
    notes = Column(Text, nullable=True)
    status = Column(Enum(QuotationStatus), nullable=False, default=QuotationStatus.submitted, index=True)
    submitted_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    shortlisted_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    shortlisted_at = Column(DateTime(timezone=True), nullable=True)

    items = relationship("QuotationItem", backref="quotation", lazy="select", cascade="all, delete-orphan")
