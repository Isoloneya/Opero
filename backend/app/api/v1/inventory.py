from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import DatabaseSession, get_current_user, require_roles
from app.models.user import User, UserRole
from app.repositories.inventory_repository import InventoryRepository
from app.schemas.inventory import (
    InventoryBalanceResponse,
    StockMovementCreate,
    StockMovementResponse,
)
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/stock-movements", tags=["stock movements"])

inventory_router = APIRouter(
    prefix="/inventory-balances",
    tags=["inventory balances"],
)

CurrentUser = Annotated[User, Depends(get_current_user)]

CurrentWarehouseOperator = Annotated[
    User,
    Depends(require_roles(UserRole.ADMIN, UserRole.WAREHOUSE_KEEPER)),
]


@router.post(
    "",
    response_model=StockMovementResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_stock_movement(
    payload: StockMovementCreate,
    database_session: DatabaseSession,
    current_operator: CurrentWarehouseOperator,
) -> StockMovementResponse:
    try:
        return InventoryService().create_movement(
            database_session=database_session,
            payload=payload,
            user_id=current_operator.id,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error


@inventory_router.get("", response_model=list[InventoryBalanceResponse])
def get_inventory_balances(
    database_session: DatabaseSession,
    current_user: CurrentUser,
    warehouse_id: int = Query(gt=0),
) -> list[InventoryBalanceResponse]:
    return InventoryRepository().get_balances_by_warehouse(
        database_session,
        warehouse_id,
    )