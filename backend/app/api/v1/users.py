from typing import Annotated
from fastapi import Response
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import DatabaseSession, require_roles
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
    UsersPageResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/users", tags=["users"])

CurrentAdmin = Annotated[User, Depends(require_roles(UserRole.ADMIN))]


@router.get("", response_model=UsersPageResponse)
def get_users(
    database_session: DatabaseSession,
    current_admin: CurrentAdmin,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> UsersPageResponse:
    users, total = UserRepository().get_page(
        database_session=database_session,
        page=page,
        page_size=page_size,
    )

    return UsersPageResponse(
        items=users,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    database_session: DatabaseSession,
    current_admin: CurrentAdmin,
) -> User:
    try:
        return AuthService().create_user(database_session, payload)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    payload: UserUpdate,
    database_session: DatabaseSession,
    current_admin: CurrentAdmin,
) -> User:
    user_repository = UserRepository()
    user = user_repository.get_by_id(database_session, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Користувача не знайдено",
        )

    if user.id == current_admin.id and payload.is_active is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неможливо деактивувати власний обліковий запис",
        )

    if payload.full_name is not None:
        user.full_name = payload.full_name.strip()

    if payload.role is not None:
        user.role = payload.role

    if payload.is_active is not None:
        user.is_active = payload.is_active

    database_session.commit()
    database_session.refresh(user)

    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    database_session: DatabaseSession,
    current_admin: CurrentAdmin,
) -> Response:
    user_repository = UserRepository()
    user = user_repository.get_by_id(database_session, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Користувача не знайдено",
        )

    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неможливо видалити власний обліковий запис",
        )

    if user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Спершу деактивуй користувача",
        )

    user_repository.delete(database_session, user)
    database_session.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)