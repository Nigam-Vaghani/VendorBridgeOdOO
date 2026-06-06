from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User
from models.rfq import RFQ
from models.quotation import Quotation
from models.purchase_order import PurchaseOrder
from models.invoice import Invoice
from dependencies import get_current_user, role_required
from schemas.vendor_api import RFQOut, QuotationOut, QuotationCreate, POOut, InvoiceOut, InvoiceCreate, DashboardStatsOut
from datetime import datetime
import uuid

router = APIRouter(prefix="/vendor", tags=["vendor"])

@router.get("/dashboard", response_model=DashboardStatsOut)
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(role_required(["vendor"]))):
    vendor_id = current_user.vendor_id
    if not vendor_id:
        return DashboardStatsOut(active_rfqs=0, pending_approvals=0, pos_this_month=0.0, overdue_invoices=0)
    
    active_rfqs = db.query(RFQ).count()
    pending_approvals = db.query(Quotation).filter(Quotation.vendor_id == vendor_id, Quotation.status == "under_review").count()
    pos = db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == vendor_id).all()
    pos_total = sum(p.total_amount for p in pos)
    overdue_invoices = db.query(Invoice).filter(Invoice.vendor_id == vendor_id, Invoice.status == "overdue").count()
    
    return DashboardStatsOut(
        active_rfqs=active_rfqs,
        pending_approvals=pending_approvals,
        pos_this_month=pos_total,
        overdue_invoices=overdue_invoices
    )

@router.get("/rfqs", response_model=List[RFQOut])
def get_vendor_rfqs(db: Session = Depends(get_db), current_user: User = Depends(role_required(["vendor"]))):
    if not current_user.vendor_id:
        return []
    
    from models.rfq_vendor import RFQVendor
    rfqs = db.query(RFQ).join(RFQVendor, RFQVendor.rfq_id == RFQ.id).filter(RFQVendor.vendor_id == current_user.vendor_id).all()
    return rfqs

@router.get("/quotations", response_model=List[QuotationOut])
def get_vendor_quotations(db: Session = Depends(get_db), current_user: User = Depends(role_required(["vendor"]))):
    if not current_user.vendor_id:
        return []
    return db.query(Quotation).filter(Quotation.vendor_id == current_user.vendor_id).all()

@router.post("/quotations", response_model=QuotationOut)
def create_quotation(quotation: QuotationCreate, db: Session = Depends(get_db), current_user: User = Depends(role_required(["vendor"]))):
    if not current_user.vendor_id:
        raise HTTPException(status_code=400, detail="User is not associated with a vendor")
    new_quote = Quotation(
        rfq_id=quotation.rfq_id,
        vendor_id=current_user.vendor_id,
        total_amount=quotation.total_amount,
        delivery_days=quotation.delivery_days,
        validity_days=quotation.validity_days,
        notes=quotation.notes,
        submitted_by=current_user.id
    )
    db.add(new_quote)
    db.commit()
    db.refresh(new_quote)
    return new_quote

@router.get("/purchase-orders", response_model=List[POOut])
def get_vendor_pos(db: Session = Depends(get_db), current_user: User = Depends(role_required(["vendor"]))):
    if not current_user.vendor_id:
        return []
    return db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == current_user.vendor_id).all()

@router.get("/invoices", response_model=List[InvoiceOut])
def get_vendor_invoices(db: Session = Depends(get_db), current_user: User = Depends(role_required(["vendor"]))):
    if not current_user.vendor_id:
        return []
    return db.query(Invoice).filter(Invoice.vendor_id == current_user.vendor_id).all()

@router.post("/invoices", response_model=InvoiceOut)
def create_invoice(invoice: InvoiceCreate, db: Session = Depends(get_db), current_user: User = Depends(role_required(["vendor"]))):
    if not current_user.vendor_id:
        raise HTTPException(status_code=400, detail="User is not associated with a vendor")
    inv_number = "INV-" + str(uuid.uuid4())[:8].upper()
    new_invoice = Invoice(
        invoice_number=inv_number,
        po_id=invoice.po_id,
        vendor_id=current_user.vendor_id,
        total=invoice.total,
        due_date=invoice.due_date,
        created_by=current_user.id,
        subtotal=invoice.total * 0.9,
        tax_amount=invoice.total * 0.1
    )
    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)
    return new_invoice
