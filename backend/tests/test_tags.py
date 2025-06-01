"""Tests for tags endpoints."""
import pytest
from httpx import AsyncClient


class TestTagsEndpoints:
    """Test tags endpoints."""

    async def test_create_tag_success(self, client: AsyncClient, auth_headers):
        """Test successful tag creation."""
        tag_data = {
            "name": "python"
        }

        response = await client.post("/api/v1/tags", json=tag_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == tag_data["name"]
        assert "id" in data
        assert "created_at" in data

    async def test_create_tag_unauthorized(self, client: AsyncClient):
        """Test tag creation without authentication."""
        tag_data = {
            "name": "unauthorized"
        }

        response = await client.post("/api/v1/tags", json=tag_data)
        
        assert response.status_code == 401

    async def test_create_tag_missing_name(self, client: AsyncClient, auth_headers):
        """Test tag creation with missing name."""
        tag_data = {}

        response = await client.post("/api/v1/tags", json=tag_data, headers=auth_headers)
        
        assert response.status_code == 422

    async def test_create_duplicate_tag(self, client: AsyncClient, auth_headers, sample_tag):
        """Test creating a tag with duplicate name."""
        tag_data = {
            "name": sample_tag["name"]
        }

        response = await client.post("/api/v1/tags", json=tag_data, headers=auth_headers)
        
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    async def test_get_tags(self, client: AsyncClient, sample_tag):
        """Test getting all tags."""
        response = await client.get("/api/v1/tags")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    async def test_get_popular_tags(self, client: AsyncClient):
        """Test getting popular tags."""
        response = await client.get("/api/v1/tags/popular")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_delete_tag_success(self, client: AsyncClient, auth_headers):
        """Test successful tag deletion."""
        # Create a tag to delete
        tag_data = {
            "name": "to-delete"
        }
        create_response = await client.post("/api/v1/tags", json=tag_data, headers=auth_headers)
        tag_id = create_response.json()["id"]

        response = await client.delete(f"/api/v1/tags/{tag_id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data

    async def test_delete_tag_unauthorized(self, client: AsyncClient, sample_tag):
        """Test tag deletion without authentication."""
        tag_id = sample_tag["id"]
        
        response = await client.delete(f"/api/v1/tags/{tag_id}")
        
        assert response.status_code == 401

    async def test_delete_nonexistent_tag(self, client: AsyncClient, auth_headers):
        """Test deleting a non-existent tag."""
        response = await client.delete("/api/v1/tags/nonexistent", headers=auth_headers)
        
        assert response.status_code == 404
