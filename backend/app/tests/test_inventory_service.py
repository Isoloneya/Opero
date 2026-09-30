from decimal import Decimal

import pytest

from app.core.security import hash_password
from app.models.inventory import InventoryBalance, StockMovementType
from app.models.product import Product
from app.models.user import User, UserRole
from app.models.warehouse import Warehouse
from app.schemas.inventory import StockMovementCreate
from app.services.inventory_service import InventoryService


def test_issue_cannot_make_inventory_balance_negative(database_session) -> None:
    user = User(
        full_name="Warehouse Administrator",
        email="warehouse-admin@example.com",
        password_hash=hash_password("password123"),
        role=UserRole.ADMIN,
        is_active=True,
    )
    warehouse = Warehouse(
        name="Test Warehouse",
        location="Kyiv",
        is_active=True,
    )
    product = Product(
        sku="TEST-001",
        name="Test Product",
        unit="шт",
        minimum_stock=Decimal("1"),
        is_active=True,
    )

    database_session.add_all([user, warehouse, product])
    database_session.commit()
    database_session.refresh(warehouse)
    database_session.refresh(product)

    balance = InventoryBalance(
        warehouse_id=warehouse.id,
        product_id=product.id,
        quantity=Decimal("5"),
    )
    database_session.add(balance)
    database_session.commit()

    payload = StockMovementCreate(
        warehouse_id=warehouse.id,
        product_id=product.id,
        type=StockMovementType.ISSUE,
        quantity=Decimal("6"),
    )

    with pytest.raises(ValueError, match="Недостатньо товару на складі"):
        InventoryService().create_movement(
            database_session,
            payload,
            user.id,
        )

    database_session.refresh(balance)

    assert balance.quantity == Decimal("5")