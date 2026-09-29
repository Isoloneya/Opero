from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.warehouse import Warehouse


class WarehouseRepository:
    def get_by_name(
        self,
        database_session: Session,
        name: str,
    ) -> Warehouse | None:
        statement = select(Warehouse).where(Warehouse.name == name)
        return database_session.scalar(statement)

    def get_page(
        self,
        database_session: Session,
        page: int,
        page_size: int,
    ) -> tuple[list[Warehouse], int]:
        total = database_session.scalar(
            select(func.count()).select_from(Warehouse)
        ) or 0

        statement = (
            select(Warehouse)
            .order_by(Warehouse.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        warehouses = list(database_session.scalars(statement))
        return warehouses, total

    def create(
        self,
        database_session: Session,
        warehouse: Warehouse,
    ) -> Warehouse:
        database_session.add(warehouse)
        database_session.flush()
        database_session.refresh(warehouse)
        return warehouse