from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from database import get_db
from dependencies import get_current_user, role_required
from models.user import User
from core.enums import RoleEnum
from schemas.rfq import (
    RFQCreate, RFQUpdate, CancelRFQRequest,
    RFQItemCreate, RFQItemUpdate,
    AssignVendorsRequest,
)
import services.rfq_service as svc

router = APIRouter(prefix="/rfqs", tags=["rfqs"])

WRITE_ROLES = [RoleEnum.admin.value, RoleEnum.manager.value, RoleEnum.procurement_officer.value]


# ─── LIST ──────────────────────────────────────────────────────────────────────

@router.get("")
def list_rfqs(
    q: Optional[str] = None,
    status: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    created_by: Optional[UUID] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at", pattern="^(deadline|created_at|title)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rfqs, total, pages = svc.list_rfqs(
        db, current_user, q, status, from_date, to_date, created_by, page, limit, sort_by, sort_order
    )
    data = [svc._build_rfq_list_item(db, r) for r in rfqs]
    return {
        "success": True,
        "data": data,
        "pagination": {"page": page, "limit": limit, "total": total, "pages": pages},
    }


# ─── GET SINGLE ────────────────────────────────────────────────────────────────

@router.get("/{rfq_id}")
def get_rfq(
    rfq_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    detail = svc.get_rfq_detail(db, rfq_id, current_user)
    return {"success": True, "data": detail}


# ─── CREATE ────────────────────────────────────────────────────────────────────

@router.post("", status_code=status.HTTP_201_CREATED)
def create_rfq(
    data: RFQCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES)),
):
    rfq = svc.create_rfq(db, data, current_user)
    detail = svc.get_rfq_detail(db, rfq.id, current_user)
    return {"success": True, "data": detail, "message": "RFQ created successfully"}


# ─── UPDATE ────────────────────────────────────────────────────────────────────

@router.put("/{rfq_id}")
def update_rfq(
    rfq_id: UUID,
    data: RFQUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES)),
):
    rfq = svc.update_rfq(db, rfq_id, data, current_user)
    detail = svc.get_rfq_detail(db, rfq.id, current_user)
    return {"success": True, "data": detail, "message": "RFQ updated successfully"}


# ─── CANCEL (DELETE) ────────────────────────────────────────────────────────────

@router.delete("/{rfq_id}")
def delete_rfq(
    rfq_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES)),
):
    svc.cancel_rfq(db, rfq_id, None, current_user)
    return {"success": True, "message": "RFQ cancelled successfully"}


# ─── ITEMS ─────────────────────────────────────────────────────────────────────

@router.post("/{rfq_id}/items", status_code=status.HTTP_201_CREATED)
def add_item(
    rfq_id: UUID,
    data: RFQItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES)),
):
    item = svc.add_item(db, rfq_id, data, current_user)
    return {"success": True, "data": item, "message": "Item added successfully"}


@router.put("/{rfq_id}/items/{item_id}")
def update_item(
    rfq_id: UUID,
    item_id: UUID,
    data: RFQItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES)),
):
    item = svc.update_item(db, rfq_id, item_id, data, current_user)
    return {"success": True, "data": item, "message": "Item updated successfully"}


@router.delete("/{rfq_id}/items/{item_id}")
def delete_item(
    rfq_id: UUID,
    item_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES)),
):
    svc.delete_item(db, rfq_id, item_id, current_user)
    return {"success": True, "message": "Item removed successfully"}


# ─── VENDORS ────────────────────────────────────────────────────────────────────

@router.post("/{rfq_id}/vendors")
def assign_vendors(
    rfq_id: UUID,
    data: AssignVendorsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES)),
):
    result = svc.assign_vendors(db, rfq_id, data, current_user)
    return {"success": True, "data": result, "message": f"{result['assigned']} vendor(s) assigned successfully"}


@router.delete("/{rfq_id}/vendors/{vendor_id}")
def remove_vendor(
    rfq_id: UUID,
    vendor_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES)),
):
    svc.remove_vendor(db, rfq_id, vendor_id, current_user)
    return {"success": True, "message": "Vendor removed from RFQ"}


# ─── STATUS TRANSITIONS ─────────────────────────────────────────────────────────

@router.post("/{rfq_id}/send")
def send_rfq(
    rfq_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES)),
):
    result = svc.send_rfq(db, rfq_id, current_user)
    return {"success": True, "data": result, "message": f"RFQ sent to {result['vendors_notified']} vendor(s)"}


@router.post("/{rfq_id}/close")
def close_rfq(
    rfq_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES)),
):
    result = svc.close_rfq(db, rfq_id, current_user)
    return {"success": True, "data": result, "message": "RFQ closed for new quotations"}


@router.post("/{rfq_id}/cancel")
def cancel_rfq(
    rfq_id: UUID,
    data: CancelRFQRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES)),
):
    rfq = svc.cancel_rfq(db, rfq_id, data.reason, current_user)
    return {"success": True, "data": {"id": rfq.id, "status": rfq.status, "reason": data.reason}, "message": "RFQ cancelled"}
