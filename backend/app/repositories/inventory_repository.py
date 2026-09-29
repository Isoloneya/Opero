from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.inventory import InventoryBalance, StockMovement


class InventoryRepository:
    def get_balance(
        self,
        database_session: Session,
        warehouse_id: int,
        product_id: int,
    ) -> InventoryBalance | None:
        statement = (
            select(InventoryBalance)
            .where(InventoryBalance.warehouse_id == warehouse_id)
            .where(InventoryBalance.product_id == product_id)
            .with_for_update()
        )

        return database_session.scalar(statement)

    def create_balance(
        self,
        database_session: Session,
        balance: InventoryBalance,
    ) -> InventoryBalance:
        database_session.add(balance)
        database_session.flush()
        database_session.refresh(balance)
        return balance

    def create_movement(
        self,
        database_session: Session,
        movement: StockMovement,
    ) -> StockMovement:
        database_session.add(movement)
        database_session.flush()
        database_session.refresh(movement)
        return movement

    def get_balances_by_warehouse(
        self,
        database_session: Session,
        warehouse_id: int,
    ) -> list[InventoryBalance]:
        statement = (
            select(InventoryBalance)
            .where(InventoryBalance.warehouse_id == warehouse_id)
            .order_by(InventoryBalance.product_id)
        )

        return list(database_session.scalars(statement))