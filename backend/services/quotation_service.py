import math
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc, asc
from fastapi import HTTPException, status

from models.quotation import Quotation
from models.quotation_item import QuotationItem
from models.rfq import RFQ
from models.rfq_item import RFQItem
from models.rfq_vendor import RFQVendor
from models.vendor import Vendor
from models.user import User
from models.activity_log import ActivityLog
from models.notification import Notification
from models.approval_request import ApprovalRequest
from models.approval_step import ApprovalStep
from core.enums import QuotationStatus, RFQStatus, RoleEnum, NotificationType, ApprovalRequestType, ApprovalStatus
from schemas.quotation import QuotationCreate, QuotationUpdate


def _log(db: Session, user_id, action: str, entity_id, details: dict = None):
    db.add(ActivityLog(
        user_id=user_id,
        action=action,
        entity_type="quotation",
        entity_id=entity_id,
        details=details or {}
    ))


def _get_quotation_or_404(db: Session, quotation_id: UUID) -> Quotation:
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return quotation


def _check_vendor_access(quotation: Quotation, current_user: User):
    if current_user.role == RoleEnum.vendor:
        if quotation.vendor_id != current_user.vendor_id:
            raise HTTPException(status_code=403, detail="Access denied")


# ─── Read Operations ───────────────────────────────────────────────────────────

def list_quotations(
    db: Session,
    current_user: User,
    rfq_id: Optional[UUID] = None,
    vendor_id: Optional[UUID] = None,
    status_filter: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    sort_by: str = "submitted_at",
    sort_order: str = "desc"
) -> Tuple[List[dict], int, int]:
    query = db.query(Quotation)

    # RBAC filtering
    if current_user.role == RoleEnum.vendor:
        if not current_user.vendor_id:
            return [], 0, 0
        query = query.filter(Quotation.vendor_id == current_user.vendor_id)
    else:
        if vendor_id:
            query = query.filter(Quotation.vendor_id == vendor_id)

    if rfq_id:
        query = query.filter(Quotation.rfq_id == rfq_id)
    if status_filter:
        query = query.filter(Quotation.status == status_filter)

    sort_col = getattr(Quotation, sort_by, Quotation.submitted_at)
    query = query.order_by(desc(sort_col) if sort_order == "desc" else asc(sort_col))

    total = query.count()
    pages = math.ceil(total / limit) if limit else 1
    quotations = query.offset((page - 1) * limit).limit(limit).all()

    result = []
    for q in quotations:
        rfq = db.query(RFQ).filter(RFQ.id == q.rfq_id).first()
        vendor = db.query(Vendor).filter(Vendor.id == q.vendor_id).first()
        submitter = db.query(User).filter(User.id == q.submitted_by).first()
        result.append({
            "id": q.id,
            "rfq_id": q.rfq_id,
            "rfq_number": rfq.rfq_number if rfq else "Unknown",
            "rfq_title": rfq.title if rfq else "Unknown",
            "vendor_id": q.vendor_id,
            "vendor_name": vendor.name if vendor else "Unknown",
            "total_amount": q.total_amount,
            "delivery_days": q.delivery_days,
            "validity_days": q.validity_days,
            "notes": q.notes,
            "status": q.status,
            "submitted_by": q.submitted_by,
            "submitted_by_name": f"{submitter.first_name} {submitter.last_name}" if submitter else None,
            "submitted_at": q.submitted_at,
            "updated_at": q.updated_at,
            "shortlisted_by": q.shortlisted_by,
            "shortlisted_at": q.shortlisted_at,
        })
    return result, total, pages


def get_quotation_detail(db: Session, quotation_id: UUID, current_user: User) -> dict:
    q = _get_quotation_or_404(db, quotation_id)
    _check_vendor_access(q, current_user)

    rfq = db.query(RFQ).filter(RFQ.id == q.rfq_id).first()
    vendor = db.query(Vendor).filter(Vendor.id == q.vendor_id).first()
    submitter = db.query(User).filter(User.id == q.submitted_by).first()

    items = db.query(QuotationItem, RFQItem).join(
        RFQItem, QuotationItem.rfq_item_id == RFQItem.id
    ).filter(QuotationItem.quotation_id == q.id).all()

    items_result = []
    for q_item, r_item in items:
        items_result.append({
            "id": q_item.id,
            "quotation_id": q.id,
            "rfq_item_id": q_item.rfq_item_id,
            "unit_price": q_item.unit_price,
            "quantity": q_item.quantity,
            "line_total": q_item.line_total,
            "delivery_days": q_item.delivery_days,
            "notes": q_item.notes,
            "product_name": r_item.product_name,
            "description": r_item.description,
            "rfq_quantity": r_item.quantity,
            "unit": r_item.unit,
            "item_no": r_item.item_no,
        })

    return {
        "id": q.id,
        "rfq_id": q.rfq_id,
        "rfq_number": rfq.rfq_number if rfq else "Unknown",
        "rfq_title": rfq.title if rfq else "Unknown",
        "vendor_id": q.vendor_id,
        "vendor_name": vendor.name if vendor else "Unknown",
        "total_amount": q.total_amount,
        "delivery_days": q.delivery_days,
        "validity_days": q.validity_days,
        "notes": q.notes,
        "status": q.status,
        "submitted_by": q.submitted_by,
        "submitted_by_name": f"{submitter.first_name} {submitter.last_name}" if submitter else None,
        "submitted_at": q.submitted_at,
        "updated_at": q.updated_at,
        "shortlisted_by": q.shortlisted_by,
        "shortlisted_at": q.shortlisted_at,
        "items": items_result,
    }


# ─── Write Operations ──────────────────────────────────────────────────────────

def submit_quotation(db: Session, data: QuotationCreate, current_user: User) -> dict:
    if current_user.role != RoleEnum.vendor or not current_user.vendor_id:
        raise HTTPException(status_code=403, detail="Only vendors can submit quotations")

    rfq = db.query(RFQ).filter(RFQ.id == data.rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    if rfq.status != RFQStatus.sent:
        raise HTTPException(status_code=400, detail="RFQ is not active")

    if rfq.deadline.tzinfo is None:
        from datetime import timezone as tz
        deadline = rfq.deadline.replace(tzinfo=tz.utc)
    else:
        deadline = rfq.deadline
    if datetime.now(timezone.utc) > deadline:
        raise HTTPException(status_code=400, detail="RFQ deadline has passed")

    is_invited = db.query(RFQVendor).filter(
        RFQVendor.rfq_id == data.rfq_id, RFQVendor.vendor_id == current_user.vendor_id
    ).first()
    if not is_invited:
        raise HTTPException(status_code=403, detail="You are not invited to this RFQ")

    existing = db.query(Quotation).filter(
        Quotation.rfq_id == data.rfq_id, Quotation.vendor_id == current_user.vendor_id,
        Quotation.status != QuotationStatus.withdrawn
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="You have already submitted a quotation for this RFQ")

    rfq_items = {item.id: item for item in db.query(RFQItem).filter(RFQItem.rfq_id == data.rfq_id).all()}
    if not rfq_items:
        raise HTTPException(status_code=400, detail="RFQ has no items")

    total_amount = 0
    q_items = []
    for item_data in data.items:
        if item_data.rfq_item_id not in rfq_items:
            raise HTTPException(status_code=400, detail=f"Invalid rfq_item_id {item_data.rfq_item_id}")
        r_item = rfq_items[item_data.rfq_item_id]
        if item_data.quantity > r_item.quantity:
            raise HTTPException(status_code=400, detail=f"Quantity for {r_item.product_name} exceeds RFQ requirement")

        line_total = item_data.unit_price * item_data.quantity
        total_amount += line_total
        q_items.append(QuotationItem(
            rfq_item_id=item_data.rfq_item_id,
            unit_price=item_data.unit_price,
            quantity=item_data.quantity,
            line_total=line_total,
            delivery_days=item_data.delivery_days,
            notes=item_data.notes
        ))

    quotation = Quotation(
        rfq_id=data.rfq_id,
        vendor_id=current_user.vendor_id,
        total_amount=total_amount,
        delivery_days=data.delivery_days,
        validity_days=data.validity_days,
        notes=data.notes,
        status=QuotationStatus.submitted,
        submitted_by=current_user.id
    )
    db.add(quotation)
    db.flush()

    for qi in q_items:
        qi.quotation_id = quotation.id
        db.add(qi)

    is_invited.responded = True

    # Notify RFQ creator
    db.add(Notification(
        user_id=rfq.created_by,
        type=NotificationType.quotation_received,
        title="Quotation Received",
        message=f"A new quotation was submitted for RFQ {rfq.rfq_number}.",
        entity_type="quotation",
        entity_id=quotation.id,
        entity_url=f"/quotations/{quotation.id}"
    ))

    _log(db, current_user.id, "submitted_quotation", quotation.id, {"total_amount": float(total_amount)})
    db.commit()
    db.refresh(quotation)
    return get_quotation_detail(db, quotation.id, current_user)


def update_quotation(db: Session, quotation_id: UUID, data: QuotationUpdate, current_user: User) -> dict:
    q = _get_quotation_or_404(db, quotation_id)
    _check_vendor_access(q, current_user)

    if q.status != QuotationStatus.submitted:
        raise HTTPException(status_code=400, detail="Only submitted quotations can be edited")

    rfq = db.query(RFQ).filter(RFQ.id == q.rfq_id).first()
    if rfq.deadline.tzinfo is None:
        from datetime import timezone as tz
        deadline = rfq.deadline.replace(tzinfo=tz.utc)
    else:
        deadline = rfq.deadline
    if datetime.now(timezone.utc) > deadline:
        raise HTTPException(status_code=400, detail="RFQ deadline has passed, cannot edit quotation")

    if data.delivery_days is not None:
        q.delivery_days = data.delivery_days
    if data.validity_days is not None:
        q.validity_days = data.validity_days
    if data.notes is not None:
        q.notes = data.notes

    if data.items is not None:
        rfq_items = {item.id: item for item in db.query(RFQItem).filter(RFQItem.rfq_id == q.rfq_id).all()}
        db.query(QuotationItem).filter(QuotationItem.quotation_id == q.id).delete()

        total_amount = 0
        for item_data in data.items:
            if item_data.rfq_item_id not in rfq_items:
                raise HTTPException(status_code=400, detail=f"Invalid rfq_item_id {item_data.rfq_item_id}")
            r_item = rfq_items[item_data.rfq_item_id]
            if item_data.quantity > r_item.quantity:
                raise HTTPException(status_code=400, detail=f"Quantity for {r_item.product_name} exceeds RFQ requirement")

            line_total = item_data.unit_price * item_data.quantity
            total_amount += line_total
            db.add(QuotationItem(
                quotation_id=q.id,
                rfq_item_id=item_data.rfq_item_id,
                unit_price=item_data.unit_price,
                quantity=item_data.quantity,
                line_total=line_total,
                delivery_days=item_data.delivery_days,
                notes=item_data.notes
            ))
        q.total_amount = total_amount

    _log(db, current_user.id, "updated_quotation", q.id)
    db.commit()
    return get_quotation_detail(db, quotation_id, current_user)


def withdraw_quotation(db: Session, quotation_id: UUID, current_user: User):
    q = _get_quotation_or_404(db, quotation_id)
    _check_vendor_access(q, current_user)

    if q.status != QuotationStatus.submitted:
        raise HTTPException(status_code=400, detail="Only submitted quotations can be withdrawn")

    q.status = QuotationStatus.withdrawn

    # If this was the only active quote for this vendor on this RFQ, set responded = False
    active_quotes = db.query(Quotation).filter(
        Quotation.rfq_id == q.rfq_id,
        Quotation.vendor_id == q.vendor_id,
        Quotation.status != QuotationStatus.withdrawn,
        Quotation.id != q.id
    ).count()
    if active_quotes == 0:
        db.query(RFQVendor).filter(
            RFQVendor.rfq_id == q.rfq_id, RFQVendor.vendor_id == q.vendor_id
        ).update({"responded": False})

    _log(db, current_user.id, "withdrawn_quotation", q.id)
    db.commit()


# ─── Comparisons & Workflows ───────────────────────────────────────────────────

def get_comparison(db: Session, rfq_id: UUID) -> dict:
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")

    quotes = db.query(Quotation).filter(
        Quotation.rfq_id == rfq_id,
        Quotation.status.in_([QuotationStatus.submitted, QuotationStatus.under_review, QuotationStatus.shortlisted, QuotationStatus.accepted])
    ).all()

    vendors_dict = {}
    for q in quotes:
        vendor = db.query(Vendor).filter(Vendor.id == q.vendor_id).first()
        vendors_dict[q.vendor_id] = vendor.name if vendor else "Unknown"

    # Process items
    rfq_items = db.query(RFQItem).filter(RFQItem.rfq_id == rfq_id).order_by(RFQItem.item_no).all()
    comparison = []

    for r_item in rfq_items:
        vendor_quotes = []
        q_items = db.query(QuotationItem).join(Quotation).filter(
            QuotationItem.rfq_item_id == r_item.id,
            Quotation.id.in_([q.id for q in quotes])
        ).all()

        lowest_price = min((qi.unit_price for qi in q_items), default=None)

        for qi in q_items:
            vendor_id = qi.quotation.vendor_id
            vendor_quotes.append({
                "vendor_id": vendor_id,
                "vendor_name": vendors_dict[vendor_id],
                "quotation_id": qi.quotation_id,
                "unit_price": qi.unit_price,
                "line_total": qi.line_total,
                "delivery_days": qi.delivery_days,
                "is_lowest": qi.unit_price == lowest_price if lowest_price is not None else False
            })

        comparison.append({
            "rfq_item_id": r_item.id,
            "item_no": r_item.item_no,
            "product_name": r_item.product_name,
            "description": r_item.description,
            "quantity": r_item.quantity,
            "unit": r_item.unit,
            "vendor_quotes": vendor_quotes
        })

    # Summary
    summary = []
    lowest_total = min((q.total_amount for q in quotes), default=None)
    for q in quotes:
        summary.append({
            "vendor_id": q.vendor_id,
            "vendor_name": vendors_dict[q.vendor_id],
            "total_amount": q.total_amount,
            "delivery_days": q.delivery_days,
            "is_lowest_total": q.total_amount == lowest_total if lowest_total is not None else False
        })

    return {
        "rfq_id": rfq.id,
        "rfq_number": rfq.rfq_number,
        "rfq_title": rfq.title,
        "total_vendors": len(quotes),
        "total_quotations": len(quotes),
        "comparison": comparison,
        "summary": summary
    }


def shortlist_quotation(db: Session, quotation_id: UUID, notes: Optional[str], current_user: User):
    q = _get_quotation_or_404(db, quotation_id)
    if q.status not in (QuotationStatus.submitted, QuotationStatus.under_review):
        raise HTTPException(status_code=400, detail="Quotation cannot be shortlisted")

    q.status = QuotationStatus.shortlisted
    q.shortlisted_by = current_user.id
    q.shortlisted_at = datetime.now(timezone.utc)

    vendor_users = db.query(User).filter(User.vendor_id == q.vendor_id).all()
    for vu in vendor_users:
        db.add(Notification(
            user_id=vu.id,
            type=NotificationType.info,
            title="Quotation Shortlisted",
            message="Your quotation has been shortlisted and is under further review.",
            entity_type="quotation",
            entity_id=q.id,
            entity_url=f"/quotations/{q.id}"
        ))

    _log(db, current_user.id, "shortlisted_quotation", q.id, {"notes": notes})
    db.commit()
    return q


def reject_quotation(db: Session, quotation_id: UUID, reason: str, current_user: User):
    q = _get_quotation_or_404(db, quotation_id)
    if q.status in (QuotationStatus.accepted, QuotationStatus.withdrawn):
        raise HTTPException(status_code=400, detail="Quotation cannot be rejected")

    q.status = QuotationStatus.rejected

    vendor_users = db.query(User).filter(User.vendor_id == q.vendor_id).all()
    for vu in vendor_users:
        db.add(Notification(
            user_id=vu.id,
            type=NotificationType.error,
            title="Quotation Rejected",
            message=f"Your quotation was rejected. Reason: {reason}",
            entity_type="quotation",
            entity_id=q.id,
            entity_url=f"/quotations/{q.id}"
        ))

    _log(db, current_user.id, "rejected_quotation", q.id, {"reason": reason})
    db.commit()
    return q


def accept_quotation(db: Session, quotation_id: UUID, notes: Optional[str], current_user: User):
    q = _get_quotation_or_404(db, quotation_id)
    if q.status != QuotationStatus.shortlisted:
        raise HTTPException(status_code=400, detail="Only shortlisted quotations can be accepted")

    # Mark as accepted
    q.status = QuotationStatus.accepted
    
    # Mark RFQ as awarded
    rfq = db.query(RFQ).filter(RFQ.id == q.rfq_id).first()
    rfq.status = RFQStatus.awarded

    # Reject other active quotes for this RFQ
    other_quotes = db.query(Quotation).filter(
        Quotation.rfq_id == q.rfq_id,
        Quotation.id != q.id,
        Quotation.status.in_([QuotationStatus.submitted, QuotationStatus.under_review, QuotationStatus.shortlisted])
    ).all()
    for oq in other_quotes:
        oq.status = QuotationStatus.rejected

    # Create Approval Request for Managers
    approval_req = ApprovalRequest(
        request_type=ApprovalRequestType.quotation,
        entity_id=q.id,
        requester_id=current_user.id,
        status=ApprovalStatus.pending,
        remarks=f"Approval requested for Quotation acceptance. {notes or ''}"
    )
    db.add(approval_req)
    db.flush()

    # Assign to all managers
    managers = db.query(User).filter(User.role == RoleEnum.manager).all()
    for manager in managers:
        db.add(ApprovalStep(
            request_id=approval_req.id,
            approver_id=manager.id,
            step_order=1,
            status=ApprovalStatus.pending
        ))
        db.add(Notification(
            user_id=manager.id,
            type=NotificationType.approval_request,
            title="Quotation Approval Required",
            message=f"A quotation needs your approval for RFQ {rfq.rfq_number}",
            entity_type="approval_request",
            entity_id=approval_req.id,
            entity_url="/approvals"
        ))

    # Notify Vendor
    vendor_users = db.query(User).filter(User.vendor_id == q.vendor_id).all()
    for vu in vendor_users:
        db.add(Notification(
            user_id=vu.id,
            type=NotificationType.success,
            title="Quotation Accepted",
            message="Your quotation has been selected! It is currently pending final internal approval.",
            entity_type="quotation",
            entity_id=q.id,
            entity_url=f"/quotations/{q.id}"
        ))

    _log(db, current_user.id, "accepted_quotation", q.id, {"notes": notes, "approval_request_id": str(approval_req.id)})
    db.commit()
    return {"id": q.id, "status": q.status, "approval_request_id": approval_req.id}
