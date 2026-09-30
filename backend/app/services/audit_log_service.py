import json

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.repositories.audit_log_repository import AuditLogRepository
from app.schemas.audit_log import AuditLogResponse, AuditLogsPageResponse


class AuditLogService:
    def __init__(
        self,
        audit_log_repository: AuditLogRepository | None = None,
    ) -> None:
        self.audit_log_repository = audit_log_repository or AuditLogRepository()

    def record(
        self,
        database_session: Session,
        user_id: int | None,
        action: str,
        entity_type: str,
        entity_id: int,
        details: dict[str, str | int | float] | None = None,
    ) -> AuditLog:
        serialized_details = (
            json.dumps(details, ensure_ascii=False) if details else None
        )

        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=serialized_details,
        )

        return self.audit_log_repository.create(database_session, audit_log)

    def get_audit_logs(
        self,
        database_session: Session,
        page: int,
        page_size: int,
    ) -> AuditLogsPageResponse:
        audit_logs, total = self.audit_log_repository.get_page(
            database_session,
            page,
            page_size,
        )

        return AuditLogsPageResponse(
            items=[
                AuditLogResponse.model_validate(audit_log)
                for audit_log in audit_logs
            ],
            total=total,
            page=page,
            page_size=page_size,
        )