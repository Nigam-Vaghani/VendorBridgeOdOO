from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from backend.database import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False) # e.g., 'RFQ', 'Approval', 'Invoice', 'Vendor'
    action = Column(String(255), nullable=False) # e.g., 'Quotation selected'
    details = Column(Text, nullable=False) # e.g., 'Infra supplies pvt ltd selected for office furniture Q2'
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Note: No soft-delete or active flags as per requirement to be immutable write-once
