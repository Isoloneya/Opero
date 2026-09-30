from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int | None
    action: str
    entity_type: str
    entity_id: int
    details: str | None
    created_at: datetime


class AuditLogsPageResponse(BaseModel):
    items: list[AuditLogResponse]
    total: int
    page: int
    page_size: int