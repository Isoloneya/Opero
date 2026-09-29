import argparse

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.schemas.user import UserCreate
from app.services.auth_service import AuthService


def create_admin(full_name: str, email: str, password: str) -> None:
    with SessionLocal() as database_session:
        existing_user = database_session.scalar(
            select(User).where(User.email == email.lower())
        )

        if existing_user:
            raise ValueError("Користувач із таким email уже існує")

        user = AuthService().create_user(
            database_session,
            UserCreate(
                full_name=full_name,
                email=email,
                password=password,
                role=UserRole.ADMIN,
            ),
        )

    print(f"Створено адміністратора з id {user.id}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--full-name", required=True)
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    arguments = parser.parse_args()

    create_admin(
        full_name=arguments.full_name,
        email=arguments.email,
        password=arguments.password,
    )