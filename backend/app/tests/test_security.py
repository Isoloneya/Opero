import jwt
import pytest

from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_password_hash_is_verified() -> None:
    password_hash = hash_password("password123")

    assert password_hash != "password123"
    assert verify_password("password123", password_hash)
    assert not verify_password("incorrect-password", password_hash)


def test_access_token_contains_user_id() -> None:
    token = create_access_token(42)

    assert decode_access_token(token) == 42


def test_invalid_access_token_raises_error() -> None:
    with pytest.raises(jwt.InvalidTokenError):
        decode_access_token("invalid-token")