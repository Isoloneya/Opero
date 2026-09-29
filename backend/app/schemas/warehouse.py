from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class WarehouseCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    location: str | None = Field(default=None, max_length=255)


class WarehouseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    location: str | None
    is_active: bool
    created_at: datetime


class WarehousesPageResponse(BaseModel):
    items: list[WarehouseResponse]
    total: int
    page: int
    page_size: int