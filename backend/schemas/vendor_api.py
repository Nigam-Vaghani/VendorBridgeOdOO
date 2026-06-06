from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class RFQItemOut(BaseModel):
    id: UUID
    item_no: int
    product_name: str
    quantity: float
    unit: str
    class Config:
        from_attributes = True

class RFQOut(BaseModel):
    id: UUID
    rfq_number: str
    title: str
    description: Optional[str]
    deadline: datetime
    status: str
    items: List[RFQItemOut] = []
    class Config:
        from_attributes = True

class QuotationOut(BaseModel):
    id: UUID
    rfq_id: UUID
    vendor_id: UUID
    total_amount: float
    delivery_days: int
    validity_days: int
    notes: Optional[str]
    status: str
    class Config:
        from_attributes = True

class QuotationCreate(BaseModel):
    rfq_id: UUID
    total_amount: float
    delivery_days: int
    validity_days: int = 30
    notes: Optional[str] = None

class POOut(BaseModel):
    id: UUID
    po_number: str
    quotation_id: UUID
    vendor_id: UUID
    status: str
    total_amount: float
    class Config:
        from_attributes = True

class InvoiceOut(BaseModel):
    id: UUID
    invoice_number: str
    po_id: UUID
    vendor_id: UUID
    total: float
    status: str
    due_date: Optional[datetime]
    class Config:
        from_attributes = True

class InvoiceCreate(BaseModel):
    po_id: UUID
    total: float
    due_date: Optional[datetime] = None

class DashboardStatsOut(BaseModel):
    active_rfqs: int
    pending_approvals: int
    pos_this_month: float
    overdue_invoices: int
