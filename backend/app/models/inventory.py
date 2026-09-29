from datetime import datetime
from decimal import Decimal
from enum import StrEnum

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class StockMovementType(StrEnum):
    RECEIPT = "receipt"
    ISSUE = "issue"


class InventoryBalance(Base):
    __tablename__ = "inventory_balances"
    __table_args__ = (
        UniqueConstraint(
            "warehouse_id",
            "product_id",
            name="uq_inventory_balances_warehouse_product",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    warehouse_id: Mapped[int] = mapped_column(
        ForeignKey("warehouses.id"),
        index=True,
    )
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"),
        index=True,
    )
    quantity: Mapped[Decimal] = mapped_column(
        Numeric(12, 3),
        default=Decimal("0"),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id: Mapped[int] = mapped_column(primary_key=True)
    warehouse_id: Mapped[int] = mapped_column(
        ForeignKey("warehouses.id"),
        index=True,
    )
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"),
        index=True,
    )
    type: Mapped[StockMovementType] = mapped_column(
        Enum(StockMovementType),
    )
    quantity: Mapped[Decimal] = mapped_column(Numeric(12, 3))
    reference_type: Mapped[str | None] = mapped_column(
        String(40),
        nullable=True,
    )
    reference_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )
    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )