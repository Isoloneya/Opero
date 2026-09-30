from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.api.deps import DatabaseSession, require_roles
from app.models.user import User, UserRole
from app.schemas.audit_log import AuditLogsPageResponse
from app.services.audit_log_service import AuditLogService

router = APIRouter(prefix="/audit-logs", tags=["audit logs"])

CurrentAdministrator = Annotated[
    User,
    Depends(require_roles(UserRole.ADMIN)),
]


@router.get("", response_model=AuditLogsPageResponse)
def get_audit_logs(
    database_session: DatabaseSession,
    current_administrator: CurrentAdministrator,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
) -> AuditLogsPageResponse:
    return AuditLogService().get_audit_logs(
        database_session,
        page,
        page_size,
    )