from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import DatabaseSession, get_current_user, require_roles
from app.models.user import User, UserRole
from app.schemas.task import (
    TaskCreate,
    TaskResponse,
    TasksPageResponse,
    TaskStatusUpdate,
)
from app.services.task_service import TaskService

router = APIRouter(prefix="/tasks", tags=["tasks"])

CurrentUser = Annotated[User, Depends(get_current_user)]

CurrentTaskCreator = Annotated[
    User,
    Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
]


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    database_session: DatabaseSession,
    current_user: CurrentTaskCreator,
) -> TaskResponse:
    try:
        return TaskService().create_task(
            database_session,
            payload,
            current_user,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error


@router.get("", response_model=TasksPageResponse)
def get_tasks(
    database_session: DatabaseSession,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
) -> TasksPageResponse:
    return TaskService().get_tasks(
        database_session,
        current_user,
        page,
        page_size,
    )


@router.patch("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: int,
    payload: TaskStatusUpdate,
    database_session: DatabaseSession,
    current_user: CurrentUser,
) -> TaskResponse:
    try:
        return TaskService().update_status(
            database_session,
            task_id,
            payload,
            current_user,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error