from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.inventory import StockMovement, StockMovementType
from app.models.request import Request, RequestItem, RequestStatus, RequestType
from app.models.user import User, UserRole
from app.repositories.inventory_repository import InventoryRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.request_repository import RequestRepository
from app.repositories.warehouse_repository import WarehouseRepository
from app.schemas.request import (
    RequestCreate,
    RequestDecision,
    RequestItemResponse,
    RequestResponse,
    RequestsPageResponse,
)


class RequestService:
    def __init__(
        self,
        request_repository: RequestRepository | None = None,
        product_repository: ProductRepository | None = None,
        warehouse_repository: WarehouseRepository | None = None,
        inventory_repository: InventoryRepository | None = None,
    ) -> None:
        self.request_repository = request_repository or RequestRepository()
        self.product_repository = product_repository or ProductRepository()
        self.warehouse_repository = warehouse_repository or WarehouseRepository()
        self.inventory_repository = inventory_repository or InventoryRepository()

    def create_request(
        self,
        database_session: Session,
        payload: RequestCreate,
        user_id: int,
    ) -> RequestResponse:
        warehouse = self.warehouse_repository.get_by_id(
            database_session,
            payload.warehouse_id,
        )

        if not warehouse or not warehouse.is_active:
            raise ValueError("Склад не знайдено або він деактивований")

        for item in payload.items:
            product = self.product_repository.get_by_id(
                database_session,
                item.product_id,
            )

            if not product or not product.is_active:
                raise ValueError(
                    f"Товар з id {item.product_id} не знайдено або він деактивований",
                )

        request = Request(
            request_number=self._create_request_number(),
            type=payload.type,
            status=RequestStatus.PENDING,
            warehouse_id=payload.warehouse_id,
            requested_by=user_id,
            reason=payload.reason,
        )

        created_request = self.request_repository.create(
            database_session,
            request,
        )

        request_items = [
            self.request_repository.create_item(
                database_session,
                RequestItem(
                    request_id=created_request.id,
                    product_id=item.product_id,
                    quantity=item.quantity,
                ),
            )
            for item in payload.items
        ]

        database_session.commit()

        return self._to_response(created_request, request_items)

    def get_requests(
        self,
        database_session: Session,
        current_user: User,
        page: int,
        page_size: int,
    ) -> RequestsPageResponse:
        requested_by = (
            current_user.id if current_user.role == UserRole.EMPLOYEE else None
        )

        requests, total = self.request_repository.get_page(
            database_session,
            page,
            page_size,
            requested_by,
        )

        return RequestsPageResponse(
            items=[
                self._to_response(
                    request,
                    self.request_repository.get_items(database_session, request.id),
                )
                for request in requests
            ],
            total=total,
            page=page,
            page_size=page_size,
        )

    def decide_request(
        self,
        database_session: Session,
        request_id: int,
        payload: RequestDecision,
        user_id: int,
    ) -> RequestResponse:
        request = self.request_repository.get_by_id(database_session, request_id)

        if not request:
            raise ValueError("Заявку не знайдено")

        if request.status != RequestStatus.PENDING:
            raise ValueError("Рішення можна прийняти лише для заявки зі статусом очікування")

        if payload.status not in {RequestStatus.APPROVED, RequestStatus.REJECTED}:
            raise ValueError("Для заявки доступне лише погодження або відхилення")

        if payload.status == RequestStatus.REJECTED and not payload.decision_comment:
            raise ValueError("Для відхиленої заявки вкажи причину")

        request.status = payload.status
        request.decided_by = user_id
        request.decision_comment = payload.decision_comment
        request.decided_at = datetime.now()

        database_session.commit()

        request_items = self.request_repository.get_items(
            database_session,
            request.id,
        )

        return self._to_response(request, request_items)

    def complete_issue_request(
        self,
        database_session: Session,
        request_id: int,
        user_id: int,
    ) -> RequestResponse:
        request = self.request_repository.get_by_id(database_session, request_id)

        if not request:
            raise ValueError("Заявку не знайдено")

        if request.type != RequestType.ISSUE:
            raise ValueError("Виконати через склад можна лише заявку на видачу")

        if request.status != RequestStatus.APPROVED:
            raise ValueError("Виконати можна лише погоджену заявку")

        request_items = self.request_repository.get_items(
            database_session,
            request.id,
        )

        required_quantities: dict[int, Decimal] = {}

        for item in request_items:
            required_quantities[item.product_id] = (
                required_quantities.get(item.product_id, Decimal("0")) + item.quantity
            )

        balances = {}

        for product_id, required_quantity in required_quantities.items():
            balance = self.inventory_repository.get_balance(
                database_session,
                request.warehouse_id,
                product_id,
            )

            if not balance or balance.quantity < required_quantity:
                raise ValueError("Недостатньо товару на складі для виконання заявки")

            balances[product_id] = balance

        for item in request_items:
            balance = balances[item.product_id]
            balance.quantity -= item.quantity

            self.inventory_repository.create_movement(
                database_session,
                StockMovement(
                    warehouse_id=request.warehouse_id,
                    product_id=item.product_id,
                    type=StockMovementType.ISSUE,
                    quantity=item.quantity,
                    created_by=user_id,
                ),
            )

        request.status = RequestStatus.COMPLETED

        database_session.commit()

        return self._to_response(request, request_items)

    def _create_request_number(self) -> str:
        prefix = datetime.now().strftime("%y%m%d")
        suffix = uuid4().hex[:6].upper()

        return f"RQ-{prefix}-{suffix}"

    def _to_response(
        self,
        request: Request,
        request_items: list[RequestItem],
    ) -> RequestResponse:
        return RequestResponse(
            id=request.id,
            request_number=request.request_number,
            type=request.type,
            status=request.status,
            warehouse_id=request.warehouse_id,
            requested_by=request.requested_by,
            decided_by=request.decided_by,
            reason=request.reason,
            decision_comment=request.decision_comment,
            decided_at=request.decided_at,
            created_at=request.created_at,
            items=[
                RequestItemResponse(
                    id=item.id,
                    product_id=item.product_id,
                    quantity=item.quantity,
                )
                for item in request_items
            ],
        )