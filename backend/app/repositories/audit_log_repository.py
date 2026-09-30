from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


class AuditLogRepository:
    def create(
        self,
        database_session: Session,
        audit_log: AuditLog,
    ) -> AuditLog:
        database_session.add(audit_log)
        database_session.flush()
        database_session.refresh(audit_log)
        return audit_log

    def get_page(
        self,
        database_session: Session,
        page: int,
        page_size: int,
    ) -> tuple[list[AuditLog], int]:
        statement = (
            select(AuditLog)
            .order_by(AuditLog.created_at.desc(), AuditLog.id.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        audit_logs = list(database_session.scalars(statement))
        total = database_session.scalar(select(func.count(AuditLog.id))) or 0

        return audit_logs, total