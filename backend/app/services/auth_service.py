from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate


class AuthService:
    def __init__(self, user_repository: UserRepository | None = None) -> None:
        self.user_repository = user_repository or UserRepository()

    def create_user(self, database_session: Session, payload: UserCreate) -> User:
        if self.user_repository.get_by_email(database_session, str(payload.email)):
            raise ValueError("Користувач із таким email уже існує")
        user = User(
            full_name=payload.full_name.strip(),
            email=str(payload.email).lower(),
            password_hash=hash_password(payload.password),
            role=payload.role,
        )
        created_user = self.user_repository.create(database_session, user)
        database_session.commit()
        return created_user

    def login(self, database_session: Session, email: str, password: str) -> str:
        user = self.user_repository.get_by_email(database_session, email)
        if not user or not user.is_active or not verify_password(password, user.password_hash):
            raise PermissionError("Невірний email або пароль")
        return create_access_token(user.id)
