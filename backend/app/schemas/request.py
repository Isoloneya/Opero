from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.request import RequestStatus, RequestType


class RequestItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: Decimal = Field(gt=0)


class RequestCreate(BaseModel):
    type: RequestType
    warehouse_id: int = Field(gt=0)
    reason: str = Field(min_length=1, max_length=2000)
    items: list[RequestItemCreate] = Field(min_length=1)


class RequestDecision(BaseModel):
    status: RequestStatus
    decision_comment: str | None = Field(default=None, max_length=2000)


class RequestItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: Decimal


class RequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    request_number: str
    type: RequestType
    status: RequestStatus
    warehouse_id: int
    requested_by: int
    decided_by: int | None
    reason: str
    decision_comment: str | None
    decided_at: datetime | None
    created_at: datetime
    items: list[RequestItemResponse]


class RequestsPageResponse(BaseModel):
    items: list[RequestResponse]
    total: int
    page: int
    page_size: int