from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from database import get_db
from dependencies import get_current_user, role_required
from models.user import User
from core.enums import RoleEnum
from schemas.quotation import (
    QuotationCreate, QuotationUpdate,
    ShortlistQuotationRequest, RejectQuotationRequest, AcceptQuotationRequest
)
import services.quotation_service as svc

router = APIRouter(prefix="/quotations", tags=["quotations"])

WRITE_ROLES = [RoleEnum.admin.value, RoleEnum.manager.value, RoleEnum.procurement_officer.value]


# ─── LIST ──────────────────────────────────────────────────────────────────────

@router.get("")
def list_quotations(
    rfq_id: Optional[UUID] = None,
    vendor_id: Optional[UUID] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("submitted_at", pattern="^(total_amount|delivery_days|submitted_at)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    quotations, total, pages = svc.list_quotations(
        db, current_user, rfq_id, vendor_id, status, page, limit, sort_by, sort_order
    )
    return {
        "success": True,
        "data": quotations,
        "pagination": {"page": page, "limit": limit, "total": total, "pages": pages},
    }


# ─── GET SINGLE ────────────────────────────────────────────────────────────────

@router.get("/{quotation_id}")
def get_quotation(
    quotation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    detail = svc.get_quotation_detail(db, quotation_id, current_user)
    return {"success": True, "data": detail}


# ─── SUBMIT (CREATE) ───────────────────────────────────────────────────────────

@router.post("", status_code=status.HTTP_201_CREATED)
def submit_quotation(
    data: QuotationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required([RoleEnum.vendor.value])),
):
    detail = svc.submit_quotation(db, data, current_user)
    return {"success": True, "data": detail, "message": "Quotation submitted successfully"}


# ─── EDIT (UPDATE) ─────────────────────────────────────────────────────────────

@router.put("/{quotation_id}")
def update_quotation(
    quotation_id: UUID,
    data: QuotationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required([RoleEnum.vendor.value])),
):
    detail = svc.update_quotation(db, quotation_id, data, current_user)
    return {"success": True, "data": detail, "message": "Quotation updated successfully"}


# ─── WITHDRAW (DELETE) ─────────────────────────────────────────────────────────

@router.delete("/{quotation_id}")
def withdraw_quotation(
    quotation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required([RoleEnum.vendor.value])),
):
    svc.withdraw_quotation(db, quotation_id, current_user)
    return {"success": True, "message": "Quotation withdrawn successfully"}


# ─── STATUS TRANSITIONS (Internal Approval Workflow) ───────────────────────────

@router.post("/{quotation_id}/shortlist")
def shortlist_quotation(
    quotation_id: UUID,
    data: ShortlistQuotationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES)),
):
    q = svc.shortlist_quotation(db, quotation_id, data.notes, current_user)
    return {
        "success": True,
        "data": {
            "id": q.id,
            "status": q.status,
            "shortlisted_by": q.shortlisted_by,
            "shortlisted_at": q.shortlisted_at
        },
        "message": "Quotation shortlisted"
    }


@router.post("/{quotation_id}/reject")
def reject_quotation(
    quotation_id: UUID,
    data: RejectQuotationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES)),
):
    q = svc.reject_quotation(db, quotation_id, data.reason, current_user)
    return {
        "success": True,
        "data": {"id": q.id, "status": q.status},
        "message": "Quotation rejected"
    }


@router.post("/{quotation_id}/accept")
def accept_quotation(
    quotation_id: UUID,
    data: AcceptQuotationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES)),
):
    result = svc.accept_quotation(db, quotation_id, data.notes, current_user)
    return {
        "success": True,
        "data": result,
        "message": "Quotation accepted, approval workflow initiated"
    }
