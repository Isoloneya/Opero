from fastapi.testclient import TestClient

from app.core.security import hash_password
from app.models.user import User, UserRole


def test_admin_can_delete_deactivated_user(
    client: TestClient,
    database_session,
    admin_headers: dict[str, str],
) -> None:
    user = User(
        full_name="Deactivated User",
        email="deactivated@example.com",
        password_hash=hash_password("password123"),
        role=UserRole.EMPLOYEE,
        is_active=False,
    )
    database_session.add(user)
    database_session.commit()
    database_session.refresh(user)

    response = client.delete(
        f"/api/v1/users/{user.id}",
        headers=admin_headers,
    )

    assert response.status_code == 204

    database_session.expire_all()

    assert database_session.get(User, user.id) is None


def test_admin_cannot_delete_active_user(
    client: TestClient,
    database_session,
    admin_headers: dict[str, str],
) -> None:
    user = User(
        full_name="Active User",
        email="active@example.com",
        password_hash=hash_password("password123"),
        role=UserRole.EMPLOYEE,
        is_active=True,
    )
    database_session.add(user)
    database_session.commit()
    database_session.refresh(user)

    response = client.delete(
        f"/api/v1/users/{user.id}",
        headers=admin_headers,
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Спершу деактивуй користувача"