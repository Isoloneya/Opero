
from sqlalchemy.orm import Session
from sqlalchemy import func, select

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
    def get_page(
        self,
        database_session: Session,
        page: int,
        page_size: int,
    ) -> tuple[list[User], int]:
        total = database_session.scalar(select(func.count()).select_from(User)) or 0

        statement = (
            select(User)
            .order_by(User.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        users = list(database_session.scalars(statement))
        return users, total
    
    def delete(
        self,
        database_session: Session,
        user: User,
    ) -> None:
        database_session.delete(user)
        database_session.flush()