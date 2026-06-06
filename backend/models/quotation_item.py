import uuid
from sqlalchemy import Column, Text, Numeric, SmallInteger, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from database import Base

class QuotationItem(Base):
    __tablename__ = "quotation_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quotation_id = Column(UUID(as_uuid=True), ForeignKey("quotations.id", ondelete="CASCADE"), nullable=False)
    rfq_item_id = Column(UUID(as_uuid=True), ForeignKey("rfq_items.id", ondelete="CASCADE"), nullable=False)
    unit_price = Column(Numeric(12, 2), nullable=False)
    quantity = Column(Numeric(12, 3), nullable=False)
    line_total = Column(Numeric(12, 2), nullable=False)
    delivery_days = Column(SmallInteger, nullable=True)
    notes = Column(Text, nullable=True)
