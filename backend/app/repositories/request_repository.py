from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.request import Request, RequestItem


class RequestRepository:
    def create(
        self,
        database_session: Session,
        request: Request,
    ) -> Request:
        database_session.add(request)
        database_session.flush()
        database_session.refresh(request)
        return request

    def create_item(
        self,
        database_session: Session,
        request_item: RequestItem,
    ) -> RequestItem:
        database_session.add(request_item)
        database_session.flush()
        database_session.refresh(request_item)
        return request_item

    def get_by_id(
        self,
        database_session: Session,
        request_id: int,
    ) -> Request | None:
        statement = select(Request).where(Request.id == request_id)

        return database_session.scalar(statement)

    def get_items(
        self,
        database_session: Session,
        request_id: int,
    ) -> list[RequestItem]:
        statement = (
            select(RequestItem)
            .where(RequestItem.request_id == request_id)
            .order_by(RequestItem.id)
        )

        return list(database_session.scalars(statement))

    def get_page(
        self,
        database_session: Session,
        page: int,
        page_size: int,
        requested_by: int | None = None,
    ) -> tuple[list[Request], int]:
        statement = select(Request).order_by(Request.created_at.desc())

        count_statement = select(func.count(Request.id))

        if requested_by is not None:
            statement = statement.where(Request.requested_by == requested_by)
            count_statement = count_statement.where(Request.requested_by == requested_by)

        statement = statement.offset((page - 1) * page_size).limit(page_size)

        requests = list(database_session.scalars(statement))
        total = database_session.scalar(count_statement) or 0

        return requests, total