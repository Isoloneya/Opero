from sqlalchemy.orm import Session

from app.models.warehouse import Warehouse
from app.repositories.warehouse_repository import WarehouseRepository
from app.schemas.warehouse import WarehouseCreate


class WarehouseService:
    def __init__(
        self,
        warehouse_repository: WarehouseRepository | None = None,
    ) -> None:
        self.warehouse_repository = warehouse_repository or WarehouseRepository()

    def create_warehouse(
        self,
        database_session: Session,
        payload: WarehouseCreate,
    ) -> Warehouse:
        name = payload.name.strip()

        if self.warehouse_repository.get_by_name(database_session, name):
            raise ValueError("Склад із такою назвою вже існує")

        warehouse = Warehouse(
            name=name,
            location=payload.location.strip() if payload.location else None,
        )

        created_warehouse = self.warehouse_repository.create(
            database_session,
            warehouse,
        )

        database_session.commit()
        return created_warehouse