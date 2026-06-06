from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Union, Any
from uuid import UUID
from datetime import datetime
from decimal import Decimal

# ─── 1. Comparison Matrix Schemas ──────────────────────────────────────────────

class VendorQuoteDetail(BaseModel):
    vendor_id: UUID
    vendor_name: str
    unit_price: Decimal
    quantity: Decimal
    line_total: Decimal
    delivery_days: Optional[int]
    is_lowest_price: bool = False
    price_diff_pct: Decimal = Decimal('0.00')
    price_diff_amount: Decimal = Decimal('0.00')

class ItemComparisonMatrix(BaseModel):
    rfq_item_id: UUID
    item_no: int
    product_name: str
    description: Optional[str] = None
    rfq_quantity: Decimal
    unit: str
    estimated_unit_price: Optional[Decimal] = None
    vendor_quotes: List[VendorQuoteDetail]

class VendorComparisonSummary(BaseModel):
    vendor_id: UUID
    vendor_name: str
    vendor_rating: Decimal
    quotation_id: UUID
    total_amount: Decimal
    delivery_days: int
    validity_days: int
    status: str
    submitted_at: datetime
    notes: Optional[str] = None
    is_lowest_total: bool = False
    is_fastest_delivery: bool = False

class ComparisonOverallSummary(BaseModel):
    lowest_total_amount: Optional[Decimal] = None
    lowest_total_vendor_id: Optional[UUID] = None
    lowest_total_vendor_name: Optional[str] = None
    fastest_delivery_days: Optional[int] = None
    fastest_delivery_vendor_id: Optional[UUID] = None
    fastest_delivery_vendor_name: Optional[str] = None
    highest_rated_vendor_id: Optional[UUID] = None
    highest_rated_vendor_name: Optional[str] = None
    highest_rating: Optional[Decimal] = None
    average_total_amount: Optional[Decimal] = None
    average_delivery_days: Optional[Decimal] = None

class ComparisonMatrixResponse(BaseModel):
    rfq_id: UUID
    rfq_number: str
    rfq_title: str
    rfq_deadline: datetime
    total_vendors: int
    total_quotations: int
    vendors: List[VendorComparisonSummary]
    item_comparison: Optional[List[ItemComparisonMatrix]] = None
    summary: ComparisonOverallSummary


# ─── 2. Comparison Table Schemas ───────────────────────────────────────────────

class TableColumn(BaseModel):
    key: str
    label: str

class TableRow(BaseModel):
    parameter: str
    highlight: Optional[str] = None
    # Vendor UUIDs will be added dynamically as additional keys, e.g., "uuid1": 425000.00

class ComparisonTableResponse(BaseModel):
    rfq_id: UUID
    rfq_number: str
    columns: List[TableColumn]
    rows: List[Dict[str, Any]]
    item_rows: List[Dict[str, Any]]


# ─── 3. Comparison Chart Schemas ───────────────────────────────────────────────

class ChartDataset(BaseModel):
    label: str
    data: List[Dict[str, Any]]  # e.g. [{"vendor": "ABC", "value": 100}]

class ChartDataResponse(BaseModel):
    chart_type: str
    rfq_id: UUID
    datasets: List[ChartDataset]


# ─── 4. Comparison Scoring Schemas ─────────────────────────────────────────────

class VendorScoreDetail(BaseModel):
    vendor_id: UUID
    vendor_name: str
    total_score: Decimal
    rank: int
    price_score: Decimal
    delivery_score: Decimal
    quality_score: Decimal
    price_rank: int
    delivery_rank: int
    quality_rank: int

class ScoreRecommendation(BaseModel):
    vendor_id: UUID
    vendor_name: str
    reason: str

class ScoringResponse(BaseModel):
    rfq_id: UUID
    weights: Dict[str, Decimal]
    scores: List[VendorScoreDetail]
    recommendation: Optional[ScoreRecommendation] = None
