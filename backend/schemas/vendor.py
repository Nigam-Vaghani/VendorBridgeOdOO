from pydantic import BaseModel, ConfigDict, EmailStr, Field, HttpUrl
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from core.enums import VendorStatus, DocType

class VendorBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    category: str = Field(..., max_length=100)
    gst_number: Optional[str] = Field(None, pattern=r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")
    pan_number: Optional[str] = Field(None, pattern=r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")
    contact_person: str = Field(..., max_length=255)
    email: EmailStr
    phone: str = Field(..., max_length=50)
    website: Optional[str] = None # HttpUrl can be strict, using str for flexibility or custom validator
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: str = "India"
    status: VendorStatus = VendorStatus.active

class VendorCreate(VendorBase):
    pass

class VendorUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    category: Optional[str] = Field(None, max_length=100)
    gst_number: Optional[str] = Field(None, pattern=r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")
    pan_number: Optional[str] = Field(None, pattern=r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")
    contact_person: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    website: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: Optional[str] = None
    status: Optional[VendorStatus] = None

class DocumentResponse(BaseModel):
    id: UUID
    vendor_id: UUID
    doc_type: DocType
    file_name: str
    file_url: str
    uploaded_by: UUID
    uploaded_by_name: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class VendorResponse(VendorBase):
    id: UUID
    rating: Decimal
    total_orders: int
    on_time_delivery_pct: Decimal
    registered_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    documents: List[DocumentResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class VendorPerformanceOrder(BaseModel):
    po_id: UUID
    po_number: str
    amount: Decimal
    status: str
    created_at: datetime

class VendorPerformanceMonth(BaseModel):
    month: str
    orders: int
    spend: Decimal

class VendorPerformance(BaseModel):
    vendor_id: UUID
    vendor_name: str
    rating: Decimal
    total_orders: int
    on_time_delivery_pct: Decimal
    total_spend: Decimal
    average_order_value: Decimal
    orders_by_month: List[VendorPerformanceMonth]
    rfq_response_rate: float
    quotation_acceptance_rate: float
    recent_orders: List[VendorPerformanceOrder]

class RFQListItem(BaseModel):
    rfq_id: UUID
    rfq_number: str
    title: str
    status: str
    deadline: datetime
    invited_at: datetime
    responded: bool
    quotation_submitted: bool

class VendorImportResult(BaseModel):
    total_rows: int
    successful: int
    failed: int
    errors: List[dict]
