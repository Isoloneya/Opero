from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    sku: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=2, max_length=160)
    unit: str = Field(min_length=1, max_length=20)
    minimum_stock: Decimal = Field(default=Decimal("0"), ge=0)


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sku: str
    name: str
    unit: str
    minimum_stock: Decimal
    is_active: bool
    created_at: datetime


class ProductsPageResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int