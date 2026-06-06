from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class RFQItemCreate(BaseModel):
    item_no: int
    product_name: str
    description: Optional[str] = None
    quantity: float
    unit: str = "NOS"

class RFQCreate(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: datetime
    terms: Optional[str] = None
    items: List[RFQItemCreate]
    vendor_ids: List[UUID]

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
