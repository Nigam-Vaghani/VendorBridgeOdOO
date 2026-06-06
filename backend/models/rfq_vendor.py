from sqlalchemy import Column, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from database import Base

class RFQVendor(Base):
    __tablename__ = "rfq_vendors"

    rfq_id = Column(UUID(as_uuid=True), ForeignKey("rfqs.id", ondelete="CASCADE"), primary_key=True)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="CASCADE"), primary_key=True)
    invited_at = Column(DateTime(timezone=True), server_default=func.now())
    invite_sent = Column(Boolean, nullable=False, default=False)
    responded = Column(Boolean, nullable=False, default=False)
