from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import DatabaseSession, get_current_user, require_roles
from app.models.user import User, UserRole
from app.repositories.product_repository import ProductRepository
from app.schemas.product import (
    ProductCreate,
    ProductResponse,
    ProductsPageResponse,
)
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["products"])

CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentAdmin = Annotated[User, Depends(require_roles(UserRole.ADMIN))]


@router.get("", response_model=ProductsPageResponse)
def get_products(
    database_session: DatabaseSession,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None, max_length=160),
) -> ProductsPageResponse:
    products, total = ProductRepository().get_page(
        database_session=database_session,
        page=page,
        page_size=page_size,
        search=search,
    )

    return ProductsPageResponse(
        items=products,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    database_session: DatabaseSession,
    current_admin: CurrentAdmin,
) -> ProductResponse:
    try:
        return ProductService().create_product(
            database_session,
            payload,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error