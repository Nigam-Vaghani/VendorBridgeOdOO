from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from core.enums import QuotationStatus


# ─── Item Schemas ──────────────────────────────────────────────────────────────

class QuotationItemBase(BaseModel):
    rfq_item_id: UUID
    unit_price: Decimal = Field(..., ge=0)
    quantity: Decimal = Field(..., gt=0)
    delivery_days: Optional[int] = Field(None, gt=0)
    notes: Optional[str] = Field(None, max_length=1000)

class QuotationItemCreate(QuotationItemBase):
    pass

class QuotationItemResponse(QuotationItemBase):
    id: UUID
    quotation_id: UUID
    line_total: Decimal
    # From RFQ Item Join
    product_name: Optional[str] = None
    description: Optional[str] = None
    rfq_quantity: Optional[Decimal] = None
    unit: Optional[str] = None
    item_no: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)


# ─── Quotation Schemas ─────────────────────────────────────────────────────────

class QuotationCreate(BaseModel):
    rfq_id: UUID
    delivery_days: int = Field(..., gt=0)
    validity_days: int = Field(default=30, gt=0)
    notes: Optional[str] = Field(None, max_length=5000)
    items: List[QuotationItemCreate] = Field(..., min_length=1)

class QuotationUpdate(BaseModel):
    delivery_days: Optional[int] = Field(None, gt=0)
    validity_days: Optional[int] = Field(None, gt=0)
    notes: Optional[str] = Field(None, max_length=5000)
    items: Optional[List[QuotationItemCreate]] = Field(None, min_length=1)

class ShortlistQuotationRequest(BaseModel):
    notes: Optional[str] = Field(None, max_length=1000)

class RejectQuotationRequest(BaseModel):
    reason: str = Field(..., min_length=2, max_length=1000)

class AcceptQuotationRequest(BaseModel):
    notes: Optional[str] = Field(None, max_length=1000)


class QuotationListResponse(BaseModel):
    id: UUID
    rfq_id: UUID
    rfq_number: str
    rfq_title: str
    vendor_id: UUID
    vendor_name: str
    total_amount: Decimal
    delivery_days: int
    validity_days: int
    notes: Optional[str] = None
    status: QuotationStatus
    submitted_by: Optional[UUID] = None
    submitted_by_name: Optional[str] = None
    submitted_at: datetime
    updated_at: datetime
    shortlisted_by: Optional[UUID] = None
    shortlisted_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class QuotationResponse(QuotationListResponse):
    items: List[QuotationItemResponse] = []
    model_config = ConfigDict(from_attributes=True)


# ─── Compare Schemas ───────────────────────────────────────────────────────────

class VendorQuoteCompare(BaseModel):
    vendor_id: UUID
    vendor_name: str
    quotation_id: UUID
    unit_price: Decimal
    line_total: Decimal
    delivery_days: Optional[int]
    is_lowest: bool = False

class ItemCompare(BaseModel):
    rfq_item_id: UUID
    item_no: int
    product_name: str
    description: Optional[str] = None
    quantity: Decimal
    unit: str
    vendor_quotes: List[VendorQuoteCompare]

class VendorSummaryCompare(BaseModel):
    vendor_id: UUID
    vendor_name: str
    total_amount: Decimal
    delivery_days: int
    is_lowest_total: bool = False

class QuotationCompareResponse(BaseModel):
    rfq_id: UUID
    rfq_number: str
    rfq_title: str
    total_vendors: int
    total_quotations: int
    comparison: List[ItemCompare]
    summary: List[VendorSummaryCompare]
