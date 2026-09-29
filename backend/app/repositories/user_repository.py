from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    def get_by_id(self, database_session: Session, user_id: int) -> User | None:
        return database_session.get(User, user_id)

    def get_by_email(self, database_session: Session, email: str) -> User | None:
        statement = select(User).where(User.email == email.lower())
        return database_session.scalar(statement)

    def create(self, database_session: Session, user: User) -> User:
        database_session.add(user)
        database_session.flush()
        database_session.refresh(user)
        return user
