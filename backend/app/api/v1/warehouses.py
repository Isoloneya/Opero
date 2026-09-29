from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import DatabaseSession, get_current_user, require_roles
from app.models.user import User, UserRole
from app.repositories.warehouse_repository import WarehouseRepository
from app.schemas.warehouse import (
    WarehouseCreate,
    WarehouseResponse,
    WarehousesPageResponse,
)
from app.services.warehouse_service import WarehouseService

router = APIRouter(prefix="/warehouses", tags=["warehouses"])

CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentAdmin = Annotated[User, Depends(require_roles(UserRole.ADMIN))]


@router.get("", response_model=WarehousesPageResponse)
def get_warehouses(
    database_session: DatabaseSession,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> WarehousesPageResponse:
    warehouses, total = WarehouseRepository().get_page(
        database_session=database_session,
        page=page,
        page_size=page_size,
    )

    return WarehousesPageResponse(
        items=warehouses,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=WarehouseResponse, status_code=status.HTTP_201_CREATED)
def create_warehouse(
    payload: WarehouseCreate,
    database_session: DatabaseSession,
    current_admin: CurrentAdmin,
) -> WarehouseResponse:
    try:
        return WarehouseService().create_warehouse(
            database_session,
            payload,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error