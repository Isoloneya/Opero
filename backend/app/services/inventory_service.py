from sqlalchemy.orm import Session

from app.models.inventory import (
    InventoryBalance,
    StockMovement,
    StockMovementType,
)
from app.repositories.inventory_repository import InventoryRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.warehouse_repository import WarehouseRepository
from app.schemas.inventory import StockMovementCreate
from app.services.audit_log_service import AuditLogService


class InventoryService:
    def __init__(
        self,
        inventory_repository: InventoryRepository | None = None,
        product_repository: ProductRepository | None = None,
        warehouse_repository: WarehouseRepository | None = None,
        audit_log_service: AuditLogService | None = None,
    ) -> None:
        self.inventory_repository = inventory_repository or InventoryRepository()
        self.product_repository = product_repository or ProductRepository()
        self.warehouse_repository = warehouse_repository or WarehouseRepository()
        self.audit_log_service = audit_log_service or AuditLogService()

    def create_movement(
        self,
        database_session: Session,
        payload: StockMovementCreate,
        user_id: int,
    ) -> StockMovement:
        warehouse = self.warehouse_repository.get_by_id(
            database_session,
            payload.warehouse_id,
        )

        if not warehouse or not warehouse.is_active:
            raise ValueError("Склад не знайдено або він деактивований")

        product = self.product_repository.get_by_id(
            database_session,
            payload.product_id,
        )

        if not product or not product.is_active:
            raise ValueError("Товар не знайдено або він деактивований")

        balance = self.inventory_repository.get_balance(
            database_session,
            payload.warehouse_id,
            payload.product_id,
        )

        if payload.type == StockMovementType.ISSUE:
            if not balance or balance.quantity < payload.quantity:
                raise ValueError("Недостатньо товару на складі")

            balance.quantity -= payload.quantity
        else:
            if balance:
                balance.quantity += payload.quantity
            else:
                balance = InventoryBalance(
                    warehouse_id=payload.warehouse_id,
                    product_id=payload.product_id,
                    quantity=payload.quantity,
                )

                self.inventory_repository.create_balance(
                    database_session,
                    balance,
                )

        movement = StockMovement(
            warehouse_id=payload.warehouse_id,
            product_id=payload.product_id,
            type=payload.type,
            quantity=payload.quantity,
            created_by=user_id,
        )

        created_movement = self.inventory_repository.create_movement(
            database_session,
            movement,
        )

        self.audit_log_service.record(
            database_session,
            user_id=user_id,
            action="stock_movement_created",
            entity_type="stock_movement",
            entity_id=created_movement.id,
            details={
                "type": payload.type.value,
                "warehouse_id": payload.warehouse_id,
                "product_id": payload.product_id,
                "quantity": float(payload.quantity),
            },
        )

        database_session.commit()

        return created_movement