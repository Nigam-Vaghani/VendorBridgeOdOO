from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, date
from calendar import monthrange

from database import get_db
from dependencies import get_current_user
from models.user import User
from models.vendor import Vendor
from models.rfq import RFQ
from models.purchase_order import PurchaseOrder
from models.invoice import Invoice
from models.approval_request import ApprovalRequest
from core.enums import RFQStatus, InvoiceStatus, ApprovalStatus, POStatus

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.utcnow()
    first_day = date(now.year, now.month, 1)
    last_day = date(now.year, now.month, monthrange(now.year, now.month)[1])

    # Active RFQs (sent status = open/active)
    active_rfqs = db.query(func.count(RFQ.id)).filter(
        RFQ.status == RFQStatus.sent
    ).scalar() or 0

    # Pending approvals
    pending_approvals = db.query(func.count(ApprovalRequest.id)).filter(
        ApprovalRequest.status == ApprovalStatus.pending
    ).scalar() or 0

    # PO total amount this month
    pos_this_month = db.query(func.coalesce(func.sum(PurchaseOrder.total_amount), 0)).filter(
        func.date(PurchaseOrder.created_at) >= first_day,
        func.date(PurchaseOrder.created_at) <= last_day,
    ).scalar() or 0

    # Overdue invoices
    overdue_invoices = db.query(func.count(Invoice.id)).filter(
        Invoice.status == InvoiceStatus.overdue
    ).scalar() or 0

    # Recent purchase orders (last 5)
    recent_pos = db.query(
        PurchaseOrder.po_number,
        Vendor.name.label("vendor_name"),
        PurchaseOrder.total_amount,
        PurchaseOrder.status
    ).join(Vendor, PurchaseOrder.vendor_id == Vendor.id).order_by(
        PurchaseOrder.created_at.desc()
    ).limit(5).all()

    recent_purchases = [
        {
            "id": row.po_number,
            "vendor": row.vendor_name,
            "amount": str(row.total_amount),
            "status": row.status.value if hasattr(row.status, 'value') else str(row.status)
        }
        for row in recent_pos
    ]

    # Format PO amount nicely
    po_amount = float(pos_this_month)
    if po_amount >= 100000:
        po_amount_str = f"₹{po_amount/100000:.1f}L"
    elif po_amount >= 1000:
        po_amount_str = f"₹{po_amount/1000:.1f}K"
    else:
        po_amount_str = f"₹{po_amount:.0f}"

    return {
        "success": True,
        "data": {
            "active_rfqs": active_rfqs,
            "pending_approvals": pending_approvals,
            "pos_this_month": po_amount_str,
            "overdue_invoices": overdue_invoices,
            "recent_purchases": recent_purchases
        }
    }
