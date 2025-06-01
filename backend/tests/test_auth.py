"""Tests for authentication endpoints."""
import pytest
from httpx import AsyncClient


class TestAuthEndpoints:
    """Test authentication endpoints."""

    async def test_login_success(self, client: AsyncClient, mock_db):
        """Test successful login."""
        login_data = {
            "username": "admin",
            "password": "admin123"
        }

        response = await client.post("/api/v1/auth/login", json=login_data)

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    async def test_login_invalid_credentials(self, client: AsyncClient):
        """Test login with invalid credentials."""
        login_data = {
            "username": "admin",
            "password": "wrongpassword"
        }

        response = await client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]

    async def test_login_missing_fields(self, client: AsyncClient):
        """Test login with missing fields."""
        response = await client.post("/api/v1/auth/login", json={})
        
        assert response.status_code == 422

    async def test_verify_token_valid(self, client: AsyncClient, auth_headers):
        """Test token verification with valid token."""
        response = await client.get("/api/v1/auth/verify", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "Token valid for user:" in data["message"]

    async def test_verify_token_invalid(self, client: AsyncClient):
        """Test token verification with invalid token."""
        headers = {"Authorization": "Bearer invalid_token"}
        response = await client.get("/api/v1/auth/verify", headers=headers)
        
        assert response.status_code == 401

    async def test_verify_token_missing(self, client: AsyncClient):
        """Test token verification without token."""
        response = await client.get("/api/v1/auth/verify")
        
        assert response.status_code == 403
