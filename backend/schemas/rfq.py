from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from core.enums import RFQStatus


# ─── Item Schemas ──────────────────────────────────────────────────────────────

class RFQItemBase(BaseModel):
    item_no: int = Field(..., ge=1)
    product_name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    quantity: Decimal = Field(..., gt=0)
    unit: str = Field(default="units", max_length=50)
    estimated_unit_price: Optional[Decimal] = Field(None, ge=0)


class RFQItemCreate(RFQItemBase):
    pass


class RFQItemUpdate(BaseModel):
    item_no: Optional[int] = Field(None, ge=1)
    product_name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    quantity: Optional[Decimal] = Field(None, gt=0)
    unit: Optional[str] = Field(None, max_length=50)
    estimated_unit_price: Optional[Decimal] = Field(None, ge=0)


class RFQItemResponse(RFQItemBase):
    id: UUID
    rfq_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ─── Vendor Schemas ────────────────────────────────────────────────────────────

class RFQVendorResponse(BaseModel):
    vendor_id: UUID
    vendor_name: str
    invited_at: datetime
    invite_sent: bool
    responded: bool
    quotation_id: Optional[UUID] = None
    model_config = ConfigDict(from_attributes=True)


class AssignVendorsRequest(BaseModel):
    vendor_ids: List[UUID] = Field(..., min_length=1)


class AssignVendorsResponse(BaseModel):
    assigned: int
    skipped: int
    vendors: List[RFQVendorResponse]


# ─── RFQ Schemas ───────────────────────────────────────────────────────────────

class RFQCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    deadline: datetime
    terms: Optional[str] = Field(None, max_length=5000)
    items: List[RFQItemCreate] = Field(..., min_length=1, max_length=50)

    @field_validator("deadline")
    @classmethod
    def deadline_must_be_future(cls, v):
        from datetime import timezone
        now = datetime.now(timezone.utc)
        if v.tzinfo is None:
            from datetime import timezone as tz
            v = v.replace(tzinfo=tz.utc)
        if v <= now:
            raise ValueError("Deadline must be a future date")
        return v

    @field_validator("items")
    @classmethod
    def items_must_have_unique_item_nos(cls, v):
        item_nos = [item.item_no for item in v]
        if len(item_nos) != len(set(item_nos)):
            raise ValueError("item_no values must be unique within items")
        return v


class RFQUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    deadline: Optional[datetime] = None
    terms: Optional[str] = Field(None, max_length=5000)

    @field_validator("deadline")
    @classmethod
    def deadline_must_be_future(cls, v):
        if v is None:
            return v
        from datetime import timezone
        now = datetime.now(timezone.utc)
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        if v <= now:
            raise ValueError("Deadline must be a future date")
        return v


class CancelRFQRequest(BaseModel):
    reason: Optional[str] = Field(None, max_length=1000)


class RFQListItem(BaseModel):
    id: UUID
    rfq_number: str
    title: str
    description: Optional[str] = None
    deadline: datetime
    status: RFQStatus
    terms: Optional[str] = None
    created_by: Optional[UUID] = None
    created_by_name: Optional[str] = None
    total_items: int = 0
    total_vendors: int = 0
    quotations_received: int = 0
    sent_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class RFQResponse(BaseModel):
    id: UUID
    rfq_number: str
    title: str
    description: Optional[str] = None
    deadline: datetime
    status: RFQStatus
    terms: Optional[str] = None
    created_by: Optional[UUID] = None
    created_by_name: Optional[str] = None
    sent_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    items: List[RFQItemResponse] = []
    vendors: List[RFQVendorResponse] = []
    model_config = ConfigDict(from_attributes=True)
