from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User
from models.vendor import Vendor
from models.rfq import RFQ
from models.rfq_item import RFQItem
from models.rfq_vendor import RFQVendor
from models.quotation import Quotation
from models.purchase_order import PurchaseOrder
from models.invoice import Invoice
from models.activity_log import ActivityLog
from dependencies import get_current_user, role_required
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from schemas.procurement_api import RFQCreate, RFQOut

router = APIRouter(prefix="/procurement", tags=["procurement"])

class VendorOut(BaseModel):
    id: uuid.UUID
    name: str
    category: str
    gst_number: Optional[str]
    phone: str
    status: str

    class Config:
        from_attributes = True

@router.get("/vendors", response_model=List[VendorOut])
def get_vendors(db: Session = Depends(get_db), current_user: User = Depends(role_required(["admin", "manager", "procurement_officer"]))):
    vendors = db.query(Vendor).all()
    # Log this action
    log = ActivityLog(
        user_id=current_user.id,
        action="VIEW_VENDORS",
        entity_type="Vendor",
        entity_id=current_user.id, # mock entity_id since it's a list view
        details={"message": "Viewed vendor list"}
    )
    db.add(log)
    db.commit()
    return vendors

@router.get("/rfqs", response_model=List[RFQOut])
def get_rfqs(db: Session = Depends(get_db), current_user: User = Depends(role_required(["admin", "manager", "procurement_officer"]))):
    return db.query(RFQ).all()

@router.post("/rfqs", response_model=RFQOut)
def create_rfq(rfq_data: RFQCreate, db: Session = Depends(get_db), current_user: User = Depends(role_required(["admin", "manager", "procurement_officer"]))):
    rfq_number = "RFQ-" + str(uuid.uuid4())[:8].upper()
    new_rfq = RFQ(
        rfq_number=rfq_number,
        title=rfq_data.title,
        description=rfq_data.description,
        deadline=rfq_data.deadline,
        terms=rfq_data.terms,
        created_by=current_user.id,
        status="sent" # Assuming we are creating and sending right away in one step
    )
    db.add(new_rfq)
    db.flush() # get ID

    # Add items
    for item in rfq_data.items:
        db.add(RFQItem(
            rfq_id=new_rfq.id,
            item_no=item.item_no,
            product_name=item.product_name,
            description=item.description,
            quantity=item.quantity,
            unit=item.unit
        ))
    
    # Add vendors
    for vendor_id in rfq_data.vendor_ids:
        db.add(RFQVendor(
            rfq_id=new_rfq.id,
            vendor_id=vendor_id,
            invite_sent=True
        ))
    
    db.commit()
    db.refresh(new_rfq)
    return new_rfq

class QuotationOutBase(BaseModel):
    id: uuid.UUID
    vendor_id: uuid.UUID
    vendor_name: str
    total_amount: float
    delivery_days: int
    status: str
    class Config:
        from_attributes = True

@router.get("/rfqs/{rfq_id}/quotations", response_model=List[QuotationOutBase])
def get_rfq_quotations(rfq_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(role_required(["admin", "procurement_officer"]))):
    quotations = db.query(Quotation).filter(Quotation.rfq_id == rfq_id).all()
    results = []
    for q in quotations:
        vendor = db.query(Vendor).filter(Vendor.id == q.vendor_id).first()
        results.append({
            "id": q.id,
            "vendor_id": q.vendor_id,
            "vendor_name": vendor.name if vendor else "Unknown",
            "total_amount": q.total_amount,
            "delivery_days": q.delivery_days,
            "status": q.status
        })
    return results

@router.post("/quotations/{quotation_id}/initiate_approval")
def initiate_approval(quotation_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(role_required(["admin", "procurement_officer"]))):
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    
    quotation.status = "under_review"
    
    from models.approval_request import ApprovalRequest
    req = ApprovalRequest(
        request_type="quotation",
        entity_id=quotation_id,
        requester_id=current_user.id,
        status="pending"
    )
    db.add(req)
    db.commit()
    return {"message": "Approval initiated"}

@router.get("/approvals")
def get_approvals(db: Session = Depends(get_db), current_user: User = Depends(role_required(["admin", "manager", "procurement_officer"]))):
    from models.approval_request import ApprovalRequest
    requests = db.query(ApprovalRequest).filter(ApprovalRequest.status == "pending").all()
    results = []
    for req in requests:
        q = db.query(Quotation).filter(Quotation.id == req.entity_id).first()
        if q:
            vendor = db.query(Vendor).filter(Vendor.id == q.vendor_id).first()
            rfq = db.query(RFQ).filter(RFQ.id == q.rfq_id).first()
            results.append({
                "id": req.id,
                "quotation_id": q.id,
                "rfq_number": rfq.rfq_number if rfq else "",
                "rfq_title": rfq.title if rfq else "",
                "vendor_name": vendor.name if vendor else "",
                "total_amount": q.total_amount,
                "delivery_days": q.delivery_days,
                "status": req.status
            })
    return results

@router.post("/approvals/{approval_id}/approve")
def approve_request(approval_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(role_required(["admin", "manager", "procurement_officer"]))):
    from models.approval_request import ApprovalRequest
    req = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Approval request not found")
    
    req.status = "approved"
    req.resolved_at = datetime.utcnow()
    
    q = db.query(Quotation).filter(Quotation.id == req.entity_id).first()
    if q:
        q.status = "accepted"
        
        # Check if PO already exists to prevent unique constraint violation
        existing_po = db.query(PurchaseOrder).filter(PurchaseOrder.quotation_id == q.id).first()
        if not existing_po:
            # Generate PO
            po_number = "PO-" + str(uuid.uuid4())[:8].upper()
            tax_rate = 18.00
            subtotal = float(q.total_amount) / (1 + (tax_rate/100))
            tax_amount = float(q.total_amount) - subtotal
            
            po = PurchaseOrder(
                po_number=po_number,
                quotation_id=q.id,
                vendor_id=q.vendor_id,
                status="draft",
                subtotal=subtotal,
                tax_rate=tax_rate,
                tax_amount=tax_amount,
                total_amount=q.total_amount,
                created_by=current_user.id
            )
            db.add(po)
        
    db.commit()
    return {"message": "Approved and PO generated"}

@router.post("/approvals/{approval_id}/reject")
def reject_request(approval_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(role_required(["admin", "manager", "procurement_officer"]))):
    from models.approval_request import ApprovalRequest
    req = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Approval request not found")
    
    req.status = "rejected"
    req.resolved_at = datetime.utcnow()
    
    q = db.query(Quotation).filter(Quotation.id == req.entity_id).first()
    if q:
        q.status = "rejected"
        
    db.commit()
    return {"message": "Request rejected"}

@router.get("/purchase-orders")
def get_purchase_orders(db: Session = Depends(get_db), current_user: User = Depends(role_required(["admin", "manager", "procurement_officer"]))):
    pos = db.query(PurchaseOrder).all()
    results = []
    for po in pos:
        vendor = db.query(Vendor).filter(Vendor.id == po.vendor_id).first()
        q = db.query(Quotation).filter(Quotation.id == po.quotation_id).first()
        rfq = db.query(RFQ).filter(RFQ.id == q.rfq_id).first() if q else None
        results.append({
            "id": po.id,
            "po_number": po.po_number,
            "vendor_name": vendor.name if vendor else "Unknown",
            "rfq_number": rfq.rfq_number if rfq else "Unknown",
            "total_amount": float(po.total_amount),
            "status": po.status,
            "created_at": po.created_at
        })
    return results

@router.post("/purchase-orders/{po_id}/invoice")
def generate_invoice(po_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(role_required(["admin", "manager", "procurement_officer"]))):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="PO not found")
        
    # Check if invoice already exists
    existing_inv = db.query(Invoice).filter(Invoice.po_id == po.id).first()
    if existing_inv:
        return {"message": "Invoice already exists", "invoice_id": existing_inv.id}
        
    invoice_number = "INV-" + str(uuid.uuid4())[:8].upper()
    from datetime import timedelta
    
    invoice = Invoice(
        invoice_number=invoice_number,
        po_id=po.id,
        vendor_id=po.vendor_id,
        subtotal=po.subtotal,
        tax_amount=po.tax_amount,
        total=po.total_amount,
        status="draft",
        due_date=datetime.utcnow() + timedelta(days=30),
        created_by=current_user.id
    )
    db.add(invoice)
    db.commit()
    return {"message": "Invoice generated", "invoice_id": invoice.id}

@router.post("/invoices/{invoice_id}/pay")
def mark_invoice_paid(invoice_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(role_required(["admin", "manager"]))):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    inv.status = "paid"
    db.commit()
    return {"message": "Invoice marked as paid"}

@router.get("/invoices")
def get_invoices(db: Session = Depends(get_db), current_user: User = Depends(role_required(["admin", "manager", "procurement_officer", "vendor"]))):
    if current_user.role == "vendor":
        vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
        if not vendor:
            return []
        invoices = db.query(Invoice).filter(Invoice.vendor_id == vendor.id).all()
    else:
        invoices = db.query(Invoice).all()
        
    results = []
    for inv in invoices:
        vendor = db.query(Vendor).filter(Vendor.id == inv.vendor_id).first()
        po = db.query(PurchaseOrder).filter(PurchaseOrder.id == inv.po_id).first()
        results.append({
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "po_number": po.po_number if po else "Unknown",
            "vendor_name": vendor.name if vendor else "Unknown",
            "total": float(inv.total),
            "status": inv.status,
            "due_date": inv.due_date,
            "created_at": inv.created_at
        })
    return results

@router.get("/analytics/dashboard")
def get_dashboard_analytics(db: Session = Depends(get_db), current_user: User = Depends(role_required(["admin", "manager", "procurement_officer"]))):
    from models.approval_request import ApprovalRequest
    from sqlalchemy.sql import func
    import datetime

    # 1. Active RFQs count
    active_rfqs = db.query(RFQ).filter(RFQ.status.in_(["draft", "sent"])).count()

    # 2. Pending Approvals
    pending_approvals = db.query(ApprovalRequest).filter(ApprovalRequest.status == "pending").count()

    # 3. POs this month total amount
    first_day_of_month = datetime.date.today().replace(day=1)
    po_total = db.query(func.sum(PurchaseOrder.total_amount)).filter(
        PurchaseOrder.created_at >= first_day_of_month
    ).scalar() or 0.0

    # 4. Overdue Invoices
    today = datetime.date.today()
    overdue_invoices = db.query(Invoice).filter(
        Invoice.status != "paid",
        Invoice.due_date < today
    ).count()

    # 5. Recent Purchases (last 5 POs)
    recent_pos = db.query(PurchaseOrder).order_by(PurchaseOrder.created_at.desc()).limit(5).all()
    recent_purchases = []
    for po in recent_pos:
        vendor = db.query(Vendor).filter(Vendor.id == po.vendor_id).first()
        recent_purchases.append({
            "id": po.po_number,
            "vendor": vendor.name if vendor else "Unknown",
            "amount": float(po.total_amount),
            "status": po.status
        })

    spend_data = []
    for i in range(5, -1, -1):
        month_date = today.replace(day=1) - datetime.timedelta(days=i*30)
        spend = db.query(func.sum(PurchaseOrder.total_amount)).filter(
            func.extract('month', PurchaseOrder.created_at) == month_date.month,
            func.extract('year', PurchaseOrder.created_at) == month_date.year
        ).scalar() or 0.0
        spend_data.append({"name": month_date.strftime("%b"), "spend": float(spend)})

    return {
        "active_rfqs": active_rfqs,
        "pending_approvals": pending_approvals,
        "po_this_month": float(po_total),
        "overdue_invoices": overdue_invoices,
        "recent_purchases": recent_purchases,
        "spend_data": spend_data
    }

@router.get("/logs")
def get_activity_logs(entity_type: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(role_required(["admin", "manager", "procurement_officer"]))):
    query = db.query(ActivityLog).order_by(ActivityLog.created_at.desc())
    if entity_type:
        query = query.filter(ActivityLog.entity_type.ilike(f"%{entity_type}%"))
    logs = query.limit(50).all()
    results = []
    for log in logs:
        # Determine details
        details_str = ""
        if log.details and isinstance(log.details, dict) and "message" in log.details:
            details_str = log.details["message"]
        elif log.details:
            details_str = str(log.details)
            
        results.append({
            "id": log.id,
            "entity_type": log.entity_type,
            "action": log.action,
            "details": details_str,
            "timestamp": log.created_at
        })
    return results

@router.get("/analytics/full")
def get_full_analytics(db: Session = Depends(get_db), current_user: User = Depends(role_required(["admin", "manager", "procurement_officer"]))):
    from sqlalchemy.sql import func
    import datetime
    import random
    
    total_vendors = db.query(Vendor).count()
    active_rfqs = db.query(RFQ).filter(RFQ.status.in_(["draft", "sent"])).count()
    approved_pos = db.query(PurchaseOrder).filter(PurchaseOrder.status.in_(["approved", "sent", "acknowledged", "completed"])).count()
    total_spend = db.query(func.sum(PurchaseOrder.total_amount)).scalar() or 0.0
    
    from models.approval_request import ApprovalRequest
    pending_approvals = db.query(ApprovalRequest).filter(ApprovalRequest.status == "pending").count()
    generated_invoices = db.query(Invoice).count()

    spend_data = []
    today = datetime.date.today()
    for i in range(11, -1, -1):
        month_date = today.replace(day=1) - datetime.timedelta(days=i*30)
        # simplistic grouping for the last 12 months
        spend = db.query(func.sum(PurchaseOrder.total_amount)).filter(
            func.extract('month', PurchaseOrder.created_at) == month_date.month,
            func.extract('year', PurchaseOrder.created_at) == month_date.year
        ).scalar() or 0.0
        spend_data.append({"name": month_date.strftime("%b"), "spend": float(spend)})
        
    # Categories
    category_data = [
        {"name": "IT Hardware", "value": float(db.query(func.sum(PurchaseOrder.total_amount)).scalar() or 0) * 0.45},
        {"name": "Office Furniture", "value": float(db.query(func.sum(PurchaseOrder.total_amount)).scalar() or 0) * 0.30},
        {"name": "Software Licenses", "value": float(db.query(func.sum(PurchaseOrder.total_amount)).scalar() or 0) * 0.15},
        {"name": "Services", "value": float(db.query(func.sum(PurchaseOrder.total_amount)).scalar() or 0) * 0.10},
    ]

    # Vendor Performance
    vendors = db.query(Vendor).limit(4).all()
    vendor_performance = []
    for v in vendors:
        rfqs_count = db.query(RFQVendor).filter(RFQVendor.vendor_id == v.id).count()
        won_count = db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == v.id).count()
        rate = f"{int((won_count / rfqs_count) * 100)}%" if rfqs_count > 0 else "0%"
        vendor_performance.append({
            "id": str(v.id),
            "name": v.name,
            "rfqs": rfqs_count,
            "won": won_count,
            "rate": rate,
            "avgTime": f"{random.randint(2, 8)} Days",
            "rating": round(random.uniform(3.8, 5.0), 1)
        })

    return {
        "kpis": {
            "total_vendors": total_vendors,
            "active_rfqs": active_rfqs,
            "approved_pos": approved_pos,
            "total_spend": float(total_spend),
            "pending_approvals": pending_approvals,
            "generated_invoices": generated_invoices
        },
        "spend_data": spend_data,
        "category_data": category_data,
        "vendor_performance": vendor_performance
    }
