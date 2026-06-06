import math
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc, asc
from fastapi import HTTPException, status

from models.rfq import RFQ
from models.rfq_item import RFQItem
from models.rfq_vendor import RFQVendor
from models.vendor import Vendor
from models.user import User
from models.activity_log import ActivityLog
from models.notification import Notification
from models.quotation import Quotation
from core.enums import RFQStatus, RoleEnum, VendorStatus, QuotationStatus, NotificationType
from schemas.rfq import RFQCreate, RFQUpdate, RFQItemCreate, RFQItemUpdate, AssignVendorsRequest
from utils.rfq_number import generate_rfq_number


def _log(db: Session, user_id, action: str, entity_id, details: dict = None):
    db.add(ActivityLog(
        user_id=user_id,
        action=action,
        entity_type="rfq",
        entity_id=entity_id,
        details=details or {}
    ))


def _get_rfq_or_404(db: Session, rfq_id: UUID) -> RFQ:
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    return rfq


def _require_draft(rfq: RFQ):
    if rfq.status != RFQStatus.draft:
        raise HTTPException(status_code=400, detail="This action requires the RFQ to be in 'draft' status")


def _check_vendor_access(db: Session, rfq: RFQ, current_user: User):
    if current_user.role == RoleEnum.vendor:
        invited = db.query(RFQVendor).filter(
            RFQVendor.rfq_id == rfq.id,
            RFQVendor.vendor_id == current_user.vendor_id
        ).first()
        if not invited:
            raise HTTPException(status_code=403, detail="You are not invited to this RFQ")


def _build_rfq_list_item(db: Session, rfq: RFQ) -> dict:
    creator = db.query(User).filter(User.id == rfq.created_by).first()
    total_items = db.query(func.count(RFQItem.id)).filter(RFQItem.rfq_id == rfq.id).scalar() or 0
    total_vendors = db.query(func.count(RFQVendor.vendor_id)).filter(RFQVendor.rfq_id == rfq.id).scalar() or 0
    quotations_received = db.query(func.count(Quotation.id)).filter(Quotation.rfq_id == rfq.id).scalar() or 0
    return {
        "id": rfq.id,
        "rfq_number": rfq.rfq_number,
        "title": rfq.title,
        "description": rfq.description,
        "deadline": rfq.deadline,
        "status": rfq.status,
        "terms": rfq.terms,
        "created_by": rfq.created_by,
        "created_by_name": f"{creator.first_name} {creator.last_name}" if creator else None,
        "total_items": total_items,
        "total_vendors": total_vendors,
        "quotations_received": quotations_received,
        "sent_at": rfq.sent_at,
        "closed_at": rfq.closed_at,
        "created_at": rfq.created_at,
        "updated_at": rfq.updated_at,
    }


def _build_vendor_list(db: Session, rfq_id: UUID) -> list:
    rfq_vendors = db.query(RFQVendor).filter(RFQVendor.rfq_id == rfq_id).all()
    result = []
    for rv in rfq_vendors:
        vendor = db.query(Vendor).filter(Vendor.id == rv.vendor_id).first()
        quotation = db.query(Quotation).filter(
            Quotation.rfq_id == rfq_id,
            Quotation.vendor_id == rv.vendor_id
        ).first()
        result.append({
            "vendor_id": rv.vendor_id,
            "vendor_name": vendor.name if vendor else "Unknown",
            "invited_at": rv.invited_at,
            "invite_sent": rv.invite_sent,
            "responded": rv.responded,
            "quotation_id": quotation.id if quotation else None,
        })
    return result


# ─── Service Functions ─────────────────────────────────────────────────────────

def list_rfqs(
    db: Session,
    current_user: User,
    q: Optional[str] = None,
    status_filter: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    created_by: Optional[UUID] = None,
    page: int = 1,
    limit: int = 20,
    sort_by: str = "created_at",
    sort_order: str = "desc"
):
    query = db.query(RFQ)

    # RBAC: vendors see only invited RFQs
    if current_user.role == RoleEnum.vendor:
        if not current_user.vendor_id:
            return [], 0, 0
        query = query.join(RFQVendor, RFQ.id == RFQVendor.rfq_id).filter(
            RFQVendor.vendor_id == current_user.vendor_id
        )

    if q:
        search = f"%{q}%"
        query = query.filter(or_(RFQ.title.ilike(search), RFQ.rfq_number.ilike(search)))

    if status_filter:
        query = query.filter(RFQ.status == status_filter)

    if from_date:
        query = query.filter(RFQ.deadline >= from_date)

    if to_date:
        query = query.filter(RFQ.deadline <= to_date)

    if created_by:
        query = query.filter(RFQ.created_by == created_by)

    sort_col = getattr(RFQ, sort_by, RFQ.created_at)
    query = query.order_by(desc(sort_col) if sort_order == "desc" else asc(sort_col))

    total = query.count()
    pages = math.ceil(total / limit) if limit else 1
    rfqs = query.offset((page - 1) * limit).limit(limit).all()
    return rfqs, total, pages


def get_rfq_detail(db: Session, rfq_id: UUID, current_user: User) -> dict:
    rfq = _get_rfq_or_404(db, rfq_id)
    _check_vendor_access(db, rfq, current_user)

    creator = db.query(User).filter(User.id == rfq.created_by).first()
    return {
        "id": rfq.id,
        "rfq_number": rfq.rfq_number,
        "title": rfq.title,
        "description": rfq.description,
        "deadline": rfq.deadline,
        "status": rfq.status,
        "terms": rfq.terms,
        "created_by": rfq.created_by,
        "created_by_name": f"{creator.first_name} {creator.last_name}" if creator else None,
        "sent_at": rfq.sent_at,
        "closed_at": rfq.closed_at,
        "created_at": rfq.created_at,
        "updated_at": rfq.updated_at,
        "items": rfq.items,
        "vendors": _build_vendor_list(db, rfq.id),
    }


def create_rfq(db: Session, data: RFQCreate, current_user: User) -> RFQ:
    rfq_number = generate_rfq_number(db)
    rfq = RFQ(
        rfq_number=rfq_number,
        title=data.title,
        description=data.description,
        deadline=data.deadline,
        terms=data.terms,
        created_by=current_user.id,
        status=RFQStatus.draft,
    )
    db.add(rfq)
    db.flush()  # get rfq.id

    for item_data in data.items:
        db.add(RFQItem(
            rfq_id=rfq.id,
            **item_data.model_dump()
        ))

    _log(db, current_user.id, "created_rfq", rfq.id, {"rfq_number": rfq_number, "title": data.title})
    db.commit()
    db.refresh(rfq)
    return rfq


def update_rfq(db: Session, rfq_id: UUID, data: RFQUpdate, current_user: User) -> RFQ:
    rfq = _get_rfq_or_404(db, rfq_id)
    _require_draft(rfq)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(rfq, field, value)

    _log(db, current_user.id, "updated_rfq", rfq.id, {"changed": list(data.model_dump(exclude_unset=True).keys())})
    db.commit()
    db.refresh(rfq)
    return rfq


def cancel_rfq(db: Session, rfq_id: UUID, reason: Optional[str], current_user: User) -> RFQ:
    rfq = _get_rfq_or_404(db, rfq_id)
    if rfq.status not in (RFQStatus.draft, RFQStatus.sent):
        raise HTTPException(status_code=400, detail="Only draft or sent RFQs can be cancelled")

    rfq.status = RFQStatus.cancelled

    # Cancel any open quotations
    db.query(Quotation).filter(
        Quotation.rfq_id == rfq_id,
        Quotation.status.notin_([QuotationStatus.accepted, QuotationStatus.rejected])
    ).update({"status": QuotationStatus.withdrawn}, synchronize_session=False)

    _log(db, current_user.id, "cancelled_rfq", rfq.id, {"reason": reason})
    db.commit()
    db.refresh(rfq)
    return rfq


# ─── Item Operations ───────────────────────────────────────────────────────────

def add_item(db: Session, rfq_id: UUID, data: RFQItemCreate, current_user: User) -> RFQItem:
    rfq = _get_rfq_or_404(db, rfq_id)
    _require_draft(rfq)

    existing = db.query(RFQItem).filter(RFQItem.rfq_id == rfq_id, RFQItem.item_no == data.item_no).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"item_no {data.item_no} already exists in this RFQ")

    item = RFQItem(rfq_id=rfq_id, **data.model_dump())
    db.add(item)
    _log(db, current_user.id, "added_rfq_item", rfq_id, {"item_no": data.item_no, "product": data.product_name})
    db.commit()
    db.refresh(item)
    return item


def update_item(db: Session, rfq_id: UUID, item_id: UUID, data: RFQItemUpdate, current_user: User) -> RFQItem:
    rfq = _get_rfq_or_404(db, rfq_id)
    _require_draft(rfq)

    item = db.query(RFQItem).filter(RFQItem.id == item_id, RFQItem.rfq_id == rfq_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in this RFQ")

    update_data = data.model_dump(exclude_unset=True)
    if "item_no" in update_data and update_data["item_no"] != item.item_no:
        dup = db.query(RFQItem).filter(
            RFQItem.rfq_id == rfq_id,
            RFQItem.item_no == update_data["item_no"],
            RFQItem.id != item_id
        ).first()
        if dup:
            raise HTTPException(status_code=409, detail=f"item_no {update_data['item_no']} already exists")

    for k, v in update_data.items():
        setattr(item, k, v)

    _log(db, current_user.id, "updated_rfq_item", rfq_id, {"item_id": str(item_id)})
    db.commit()
    db.refresh(item)
    return item


def delete_item(db: Session, rfq_id: UUID, item_id: UUID, current_user: User):
    rfq = _get_rfq_or_404(db, rfq_id)
    _require_draft(rfq)

    item = db.query(RFQItem).filter(RFQItem.id == item_id, RFQItem.rfq_id == rfq_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in this RFQ")

    db.delete(item)
    _log(db, current_user.id, "deleted_rfq_item", rfq_id, {"item_id": str(item_id)})
    db.commit()


# ─── Vendor Operations ─────────────────────────────────────────────────────────

def assign_vendors(db: Session, rfq_id: UUID, data: AssignVendorsRequest, current_user: User) -> dict:
    rfq = _get_rfq_or_404(db, rfq_id)
    _require_draft(rfq)

    assigned = 0
    skipped = 0
    new_vendors = []

    for vendor_id in set(data.vendor_ids):
        vendor = db.query(Vendor).filter(Vendor.id == vendor_id, Vendor.status == VendorStatus.active).first()
        if not vendor:
            skipped += 1
            continue

        already = db.query(RFQVendor).filter(
            RFQVendor.rfq_id == rfq_id, RFQVendor.vendor_id == vendor_id
        ).first()
        if already:
            skipped += 1
            continue

        rv = RFQVendor(rfq_id=rfq_id, vendor_id=vendor_id)
        db.add(rv)
        db.flush()
        new_vendors.append({
            "vendor_id": vendor_id,
            "vendor_name": vendor.name,
            "invited_at": rv.invited_at,
            "invite_sent": False,
            "responded": False,
            "quotation_id": None,
        })
        assigned += 1

    _log(db, current_user.id, "assigned_vendors", rfq_id, {"assigned": assigned, "skipped": skipped})
    db.commit()
    return {"assigned": assigned, "skipped": skipped, "vendors": new_vendors}


def remove_vendor(db: Session, rfq_id: UUID, vendor_id: UUID, current_user: User):
    rfq = _get_rfq_or_404(db, rfq_id)
    _require_draft(rfq)

    rv = db.query(RFQVendor).filter(RFQVendor.rfq_id == rfq_id, RFQVendor.vendor_id == vendor_id).first()
    if not rv:
        raise HTTPException(status_code=404, detail="Vendor not assigned to this RFQ")

    if rv.responded:
        raise HTTPException(status_code=400, detail="Cannot remove a vendor who has already responded")

    db.delete(rv)
    _log(db, current_user.id, "removed_vendor", rfq_id, {"vendor_id": str(vendor_id)})
    db.commit()


# ─── Status Transitions ────────────────────────────────────────────────────────

def send_rfq(db: Session, rfq_id: UUID, current_user: User) -> dict:
    rfq = _get_rfq_or_404(db, rfq_id)
    _require_draft(rfq)

    vendor_count = db.query(func.count(RFQVendor.vendor_id)).filter(RFQVendor.rfq_id == rfq_id).scalar() or 0
    if vendor_count == 0:
        raise HTTPException(status_code=400, detail="Assign at least one vendor before sending the RFQ")

    rfq.status = RFQStatus.sent
    rfq.sent_at = datetime.now(timezone.utc)

    # Mark all vendors as invite_sent
    db.query(RFQVendor).filter(RFQVendor.rfq_id == rfq_id).update({"invite_sent": True}, synchronize_session=False)

    # Create in-app notifications for each vendor user
    vendor_users = db.query(User).join(RFQVendor, User.vendor_id == RFQVendor.vendor_id).filter(
        RFQVendor.rfq_id == rfq_id
    ).all()
    for vu in vendor_users:
        db.add(Notification(
            user_id=vu.id,
            type=NotificationType.rfq_invite,
            title=f"New RFQ: {rfq.title}",
            message=f"You have been invited to quote on RFQ {rfq.rfq_number}. Deadline: {rfq.deadline.strftime('%d %b %Y')}.",
            entity_type="rfq",
            entity_id=rfq.id,
            entity_url=f"/rfqs/{rfq.id}",
        ))

    _log(db, current_user.id, "sent_rfq", rfq.id, {"vendors_notified": vendor_count})
    db.commit()
    db.refresh(rfq)
    return {"id": rfq.id, "status": rfq.status, "sent_at": rfq.sent_at, "vendors_notified": vendor_count}


def close_rfq(db: Session, rfq_id: UUID, current_user: User) -> dict:
    rfq = _get_rfq_or_404(db, rfq_id)
    if rfq.status != RFQStatus.sent:
        raise HTTPException(status_code=400, detail="Only 'sent' RFQs can be closed")

    rfq.status = RFQStatus.closed
    rfq.closed_at = datetime.now(timezone.utc)

    _log(db, current_user.id, "closed_rfq", rfq.id)
    db.commit()
    db.refresh(rfq)
    return {"id": rfq.id, "status": rfq.status, "closed_at": rfq.closed_at}
