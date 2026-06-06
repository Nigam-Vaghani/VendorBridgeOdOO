import uuid
from sqlalchemy import Column, String, Text, DateTime, Numeric, ForeignKey, SmallInteger
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from database import Base

class RFQItem(Base):
    __tablename__ = "rfq_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rfq_id = Column(UUID(as_uuid=True), ForeignKey("rfqs.id", ondelete="CASCADE"), nullable=False)
    item_no = Column(SmallInteger, nullable=False)
    product_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    quantity = Column(Numeric(12, 3), nullable=False)
    unit = Column(String(50), nullable=False, default="units")
    estimated_unit_price = Column(Numeric(12, 2), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    rfq = relationship("RFQ", back_populates="items")
