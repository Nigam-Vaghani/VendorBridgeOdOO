from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.models.activity import ActivityLog as ActivityLogModel
from backend.schemas.activity import ActivityLog as ActivityLogSchema
from backend.schemas.activity import ActivityLogCreate

router = APIRouter(prefix="/api/logs", tags=["Activity Logs"])

@router.get("/", response_model=List[ActivityLogSchema])
def get_activity_logs(
    entity_type: Optional[str] = Query(None, description="Filter by entity type (e.g. RFQ, Approvals)"),
    db: Session = Depends(get_db)
):
    query = db.query(ActivityLogModel).order_by(ActivityLogModel.timestamp.desc())
    if entity_type and entity_type.lower() != "all":
        query = query.filter(ActivityLogModel.entity_type.ilike(entity_type))
    return query.all()

@router.post("/", response_model=ActivityLogSchema)
def create_activity_log(
    log: ActivityLogCreate,
    db: Session = Depends(get_db)
):
    db_log = ActivityLogModel(
        entity_type=log.entity_type,
        action=log.action,
        details=log.details,
        user_id=log.user_id
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log
