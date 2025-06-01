"""Tests for posts endpoints."""
import pytest
from httpx import AsyncClient


class TestPostsEndpoints:
    """Test posts endpoints."""

    async def test_create_post_success(self, client: AsyncClient, auth_headers, sample_category):
        """Test successful post creation."""
        post_data = {
            "title": "New Test Post",
            "content": "This is the content of the test post",
            "summary": "Test summary",
            "category_id": sample_category["id"],
            "tags": [],
            "published": True
        }

        response = await client.post("/api/v1/posts", json=post_data, headers=auth_headers)
        
        assert response.status_code == 201  # POST는 보통 201을 반환
        data = response.json()
        assert data["title"] == post_data["title"]
        assert data["content"] == post_data["content"]
        assert data["published"] == post_data["published"]
        assert "id" in data
        assert "created_at" in data

    async def test_create_post_unauthorized(self, client: AsyncClient):
        """Test post creation without authentication."""
        post_data = {
            "title": "Unauthorized Post",
            "content": "This should fail",
            "published": True
        }

        response = await client.post("/api/v1/posts", json=post_data)
        
        assert response.status_code == 401

    async def test_create_post_missing_required_fields(self, client: AsyncClient, auth_headers):
        """Test post creation with missing required fields."""
        post_data = {
            "content": "Missing title"
        }

        response = await client.post("/api/v1/posts", json=post_data, headers=auth_headers)
        
        assert response.status_code == 422

    async def test_get_posts_public(self, client: AsyncClient, sample_post):
        """Test getting public posts."""
        response = await client.get("/api/v1/posts")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_get_posts_with_pagination(self, client: AsyncClient):
        """Test getting posts with pagination."""
        response = await client.get("/api/v1/posts?skip=0&limit=5")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 5

    async def test_get_posts_with_category_filter(self, client: AsyncClient, sample_category):
        """Test getting posts filtered by category."""
        response = await client.get(f"/api/v1/posts?category={sample_category['name']}")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_get_posts_with_search(self, client: AsyncClient):
        """Test getting posts with search query."""
        response = await client.get("/api/v1/posts?search=test")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_get_single_post(self, client: AsyncClient, sample_post):
        """Test getting a single post."""
        post_id = sample_post["id"]
        response = await client.get(f"/api/v1/posts/{post_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == post_id

    async def test_get_nonexistent_post(self, client: AsyncClient):
        """Test getting a non-existent post."""
        response = await client.get("/api/v1/posts/nonexistent")
        
        assert response.status_code == 404

    async def test_update_post_success(self, client: AsyncClient, auth_headers, sample_post):
        """Test successful post update."""
        post_id = sample_post["id"]
        update_data = {
            "title": "Updated Title",
            "content": sample_post["content"],
            "published": sample_post["published"]
        }

        response = await client.put(f"/api/v1/posts/{post_id}", json=update_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == update_data["title"]

    async def test_update_post_unauthorized(self, client: AsyncClient, sample_post):
        """Test post update without authentication."""
        post_id = sample_post["id"]
        update_data = {
            "title": "Unauthorized Update"
        }

        response = await client.put(f"/api/v1/posts/{post_id}", json=update_data)
        
        assert response.status_code == 401

    async def test_delete_post_success(self, client: AsyncClient, auth_headers, sample_post):
        """Test successful post deletion."""
        post_id = sample_post["id"]
        
        response = await client.delete(f"/api/v1/posts/{post_id}", headers=auth_headers)
        
        assert response.status_code == 204  # DELETE는 보통 204를 반환

    async def test_delete_post_unauthorized(self, client: AsyncClient, sample_post):
        """Test post deletion without authentication."""
        post_id = sample_post["id"]
        
        response = await client.delete(f"/api/v1/posts/{post_id}")
        
        assert response.status_code == 401

    async def test_delete_nonexistent_post(self, client: AsyncClient, auth_headers):
        """Test deleting a non-existent post."""
        response = await client.delete("/api/v1/posts/nonexistent", headers=auth_headers)
        
        assert response.status_code == 404
