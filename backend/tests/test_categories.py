"""Tests for categories endpoints."""
import pytest
from httpx import AsyncClient


class TestCategoriesEndpoints:
    """Test categories endpoints."""

    async def test_create_category_success(self, client: AsyncClient, auth_headers):
        """Test successful category creation."""
        category_data = {
            "name": "Technology",
            "description": "Technology related posts"
        }

        response = await client.post("/api/v1/categories", json=category_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == category_data["name"]
        assert data["description"] == category_data["description"]
        assert "id" in data
        assert "created_at" in data

    async def test_create_category_unauthorized(self, client: AsyncClient):
        """Test category creation without authentication."""
        category_data = {
            "name": "Unauthorized Category"
        }

        response = await client.post("/api/v1/categories", json=category_data)
        
        assert response.status_code == 401

    async def test_create_category_missing_name(self, client: AsyncClient, auth_headers):
        """Test category creation with missing name."""
        category_data = {
            "description": "Missing name"
        }

        response = await client.post("/api/v1/categories", json=category_data, headers=auth_headers)
        
        assert response.status_code == 422

    async def test_create_duplicate_category(self, client: AsyncClient, auth_headers, sample_category):
        """Test creating a category with duplicate name."""
        category_data = {
            "name": sample_category["name"],
            "description": "Duplicate name"
        }

        response = await client.post("/api/v1/categories", json=category_data, headers=auth_headers)
        
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    async def test_get_categories(self, client: AsyncClient, sample_category):
        """Test getting all categories."""
        response = await client.get("/api/v1/categories")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    async def test_get_single_category(self, client: AsyncClient, sample_category):
        """Test getting a single category."""
        category_id = sample_category["id"]
        response = await client.get(f"/api/v1/categories/{category_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == category_id
        assert data["name"] == sample_category["name"]

    async def test_get_nonexistent_category(self, client: AsyncClient):
        """Test getting a non-existent category."""
        response = await client.get("/api/v1/categories/nonexistent")
        
        assert response.status_code == 404

    async def test_update_category_success(self, client: AsyncClient, auth_headers, sample_category):
        """Test successful category update."""
        category_id = sample_category["id"]
        update_data = {
            "name": "Updated Category",
            "description": "Updated description"
        }

        response = await client.put(f"/api/v1/categories/{category_id}", json=update_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]

    async def test_update_category_unauthorized(self, client: AsyncClient, sample_category):
        """Test category update without authentication."""
        category_id = sample_category["id"]
        update_data = {
            "name": "Unauthorized Update"
        }

        response = await client.put(f"/api/v1/categories/{category_id}", json=update_data)
        
        assert response.status_code == 401

    async def test_delete_category_success(self, client: AsyncClient, auth_headers):
        """Test successful category deletion."""
        # Create a category to delete
        category_data = {
            "name": "To Delete",
            "description": "This will be deleted"
        }
        create_response = await client.post("/api/v1/categories", json=category_data, headers=auth_headers)
        category_id = create_response.json()["id"]

        response = await client.delete(f"/api/v1/categories/{category_id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data

    async def test_delete_category_unauthorized(self, client: AsyncClient, sample_category):
        """Test category deletion without authentication."""
        category_id = sample_category["id"]
        
        response = await client.delete(f"/api/v1/categories/{category_id}")
        
        assert response.status_code == 401

    async def test_delete_nonexistent_category(self, client: AsyncClient, auth_headers):
        """Test deleting a non-existent category."""
        response = await client.delete("/api/v1/categories/nonexistent", headers=auth_headers)
        
        assert response.status_code == 404
