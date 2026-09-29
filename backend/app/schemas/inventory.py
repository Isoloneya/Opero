from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.inventory import StockMovementType


class StockMovementCreate(BaseModel):
    warehouse_id: int = Field(gt=0)
    product_id: int = Field(gt=0)
    type: StockMovementType
    quantity: Decimal = Field(gt=0)


class StockMovementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    warehouse_id: int
    product_id: int
    type: StockMovementType
    quantity: Decimal
    created_by: int
    created_at: datetime


class InventoryBalanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    warehouse_id: int
    product_id: int
    quantity: Decimal
    updated_at: datetime