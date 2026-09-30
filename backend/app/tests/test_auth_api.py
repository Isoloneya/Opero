from fastapi.testclient import TestClient


def test_login_returns_access_token(
    client: TestClient,
    admin_user,
) -> None:
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": admin_user.email,
            "password": "password123",
        },
    )

    assert response.status_code == 200
    assert response.json()["access_token"]
    assert response.json()["token_type"] == "bearer"


def test_login_rejects_invalid_password(
    client: TestClient,
    admin_user,
) -> None:
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": admin_user.email,
            "password": "incorrect-password",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Невірний email або пароль"


def test_register_creates_demo_admin(
    client: TestClient,
) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Demo Administrator",
            "email": "demo-admin@example.com",
            "password": "password123",
            "role": "admin",
        },
    )

    assert response.status_code == 201
    assert response.json()["access_token"]