from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import DatabaseSession, get_current_user, require_roles
from app.models.user import User, UserRole
from app.schemas.request import (
    RequestCreate,
    RequestDecision,
    RequestResponse,
    RequestsPageResponse,
)
from app.services.request_service import RequestService

router = APIRouter(prefix="/requests", tags=["requests"])

CurrentUser = Annotated[User, Depends(get_current_user)]

CurrentApprover = Annotated[
    User,
    Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
]


@router.post("", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(
    payload: RequestCreate,
    database_session: DatabaseSession,
    current_user: CurrentUser,
) -> RequestResponse:
    try:
        return RequestService().create_request(
            database_session,
            payload,
            current_user.id,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error


@router.get("", response_model=RequestsPageResponse)
def get_requests(
    database_session: DatabaseSession,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> RequestsPageResponse:
    return RequestService().get_requests(
        database_session,
        current_user,
        page,
        page_size,
    )


@router.patch("/{request_id}/decision", response_model=RequestResponse)
def decide_request(
    request_id: int,
    payload: RequestDecision,
    database_session: DatabaseSession,
    current_approver: CurrentApprover,
) -> RequestResponse:
    try:
        return RequestService().decide_request(
            database_session,
            request_id,
            payload,
            current_approver.id,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error