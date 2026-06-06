from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class ActivityLogBase(BaseModel):
    entity_type: str
    action: str
    details: str
    user_id: Optional[int] = None

class ActivityLogCreate(ActivityLogBase):
    pass

class ActivityLog(ActivityLogBase):
    id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
