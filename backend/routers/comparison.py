import json
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from database import get_db
from dependencies import get_current_user, role_required
from models.user import User
from core.enums import RoleEnum

import services.comparison_service as svc

router = APIRouter(prefix="/quotations/compare", tags=["comparison"])

WRITE_ROLES = [RoleEnum.admin.value, RoleEnum.manager.value, RoleEnum.procurement_officer.value]

@router.get("/{rfq_id}")
def get_comparison_matrix(
    rfq_id: UUID,
    include_items: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES))
):
    data = svc.get_comparison_matrix(db, str(rfq_id), include_items)
    return {"success": True, "data": data}

@router.get("/{rfq_id}/table")
def get_comparison_table(
    rfq_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES))
):
    data = svc.get_comparison_table(db, str(rfq_id))
    return {"success": True, "data": data}

@router.get("/{rfq_id}/chart")
def get_comparison_chart(
    rfq_id: UUID,
    chart_type: str = Query("bar", pattern="^(bar|radar|pie)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES))
):
    data = svc.get_comparison_chart(db, str(rfq_id), chart_type)
    return {"success": True, "data": data}

@router.get("/{rfq_id}/score")
def get_comparison_scoring(
    rfq_id: UUID,
    weights: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES))
):
    w_dict = {"price": 40, "delivery": 30, "quality": 30}
    if weights:
        try:
            w_dict = json.loads(weights)
        except json.JSONDecodeError:
            pass
            
    data = svc.get_comparison_scoring(db, str(rfq_id), w_dict)
    return {"success": True, "data": data}

@router.get("/{rfq_id}/export")
def export_comparison(
    rfq_id: UUID,
    format: str = Query("pdf", pattern="^(pdf|csv)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES))
):
    # Note: Export service returns a StreamingResponse directly
    return svc.export_comparison(db, str(rfq_id), format)
