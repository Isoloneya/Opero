import os

os.environ.setdefault("SECRET_KEY", "test-secret-key")

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.base import Base
from app.models import User
from app.models.user import UserRole
from app.schemas.user import UserCreate
from app.services.auth_service import AuthService


def test_auth_service_creates_user_and_issues_token() -> None:
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    payload = UserCreate(
        full_name="Олена Коваль",
        email="olena@example.com",
        password="secure-password",
        role=UserRole.ADMIN,
    )

    with Session(engine) as database_session:
        service = AuthService()
        user = service.create_user(database_session, payload)
        token = service.login(database_session, "olena@example.com", "secure-password")

    assert user.id == 1
    assert decode_access_token(token) == user.id


def test_auth_service_rejects_duplicate_email() -> None:
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    payload = UserCreate(
        full_name="Олена Коваль",
        email="olena@example.com",
        password="secure-password",
        role=UserRole.ADMIN,
    )

    with Session(engine) as database_session:
        service = AuthService()
        service.create_user(database_session, payload)
        try:
            service.create_user(database_session, payload)
        except ValueError as error:
            assert str(error) == "Користувач із таким email уже існує"
        else:
            raise AssertionError("Очікувалася помилка дублювання email")
