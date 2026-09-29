from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import DatabaseSession, get_current_user
from app.models.user import User
from app.schemas.auth import CurrentUserResponse, LoginRequest, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, database_session: DatabaseSession) -> TokenResponse:
    try:
        token = AuthService().login(database_session, str(payload.email), payload.password)
    except PermissionError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(error)) from error
    return TokenResponse(access_token=token)


@router.get("/me", response_model=CurrentUserResponse)
def get_me(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    return current_user
