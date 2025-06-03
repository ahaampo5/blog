"""Integration tests for the blog API."""
import pytest
from httpx import AsyncClient


class TestBlogIntegration:
    """Integration tests for the blog system."""

    async def test_complete_blog_workflow(self, client: AsyncClient, auth_headers):
        """Test complete blog workflow: create category, tag, and post."""
        # 1. Create a category
        category_data = {
            "name": "Integration Test",
            "description": "Category for integration testing"
        }
        category_response = await client.post("/api/v1/categories", json=category_data, headers=auth_headers)
        assert category_response.status_code == 200
        category = category_response.json()

        # 2. Create tags
        tag1_data = {"name": "integration"}
        tag1_response = await client.post("/api/v1/tags", json=tag1_data, headers=auth_headers)
        assert tag1_response.status_code == 200
        tag1 = tag1_response.json()

        tag2_data = {"name": "testing"}
        tag2_response = await client.post("/api/v1/tags", json=tag2_data, headers=auth_headers)
        assert tag2_response.status_code == 200
        tag2 = tag2_response.json()

        # 3. Create a post with category and tags
        post_data = {
            "title": "Integration Test Post",
            "content": "This post tests the complete workflow",
            "summary": "Integration test summary",
            "category_id": category["id"],
            "tags": [tag1["id"], tag2["id"]],
            "published": True
        }
        post_response = await client.post("/api/v1/posts", json=post_data, headers=auth_headers)
        assert post_response.status_code == 200
        post = post_response.json()

        # 4. Verify the post appears in public listing
        public_posts_response = await client.get("/api/v1/posts")
        assert public_posts_response.status_code == 200
        public_posts = public_posts_response.json()
        
        post_ids = [p["id"] for p in public_posts]
        assert post["id"] in post_ids

        # 5. Verify the post can be retrieved individually
        single_post_response = await client.get(f"/api/v1/posts/{post['id']}")
        assert single_post_response.status_code == 200
        retrieved_post = single_post_response.json()
        assert retrieved_post["title"] == post_data["title"]

        # 6. Update the post
        update_data = {
            "title": "Updated Integration Test Post",
            "content": post_data["content"],
            "published": post_data["published"]
        }
        update_response = await client.put(f"/api/v1/posts/{post['id']}", json=update_data, headers=auth_headers)
        assert update_response.status_code == 200
        updated_post = update_response.json()
        assert updated_post["title"] == update_data["title"]

        # 7. Test filtering by category
        category_filter_response = await client.get(f"/api/v1/posts?category={category['name']}")
        assert category_filter_response.status_code == 200
        filtered_posts = category_filter_response.json()
        assert any(p["id"] == post["id"] for p in filtered_posts)

        # 8. Test search functionality
        search_response = await client.get("/api/v1/posts?search=Integration")
        assert search_response.status_code == 200
        search_results = search_response.json()
        assert any(p["id"] == post["id"] for p in search_results)

    async def test_post_view_count_increment(self, client: AsyncClient, sample_post):
        """Test that viewing a post increments the view count."""
        post_id = sample_post["id"]
        
        # Get initial view count
        initial_response = await client.get(f"/api/v1/posts/{post_id}")
        initial_post = initial_response.json()
        initial_views = initial_post.get("view_count", 0)

        # View the post again
        await client.get(f"/api/v1/posts/{post_id}")
        
        # Check if view count increased
        updated_response = await client.get(f"/api/v1/posts/{post_id}")
        updated_post = updated_response.json()
        updated_views = updated_post.get("view_count", 0)
        
        assert updated_views > initial_views

    async def test_pagination_functionality(self, client: AsyncClient, auth_headers):
        """Test pagination with multiple posts."""
        # Create multiple posts
        for i in range(15):
            post_data = {
                "title": f"Pagination Test Post {i}",
                "content": f"Content for post {i}",
                "published": True
            }
            await client.post("/api/v1/posts", json=post_data, headers=auth_headers)

        # Test first page
        page1_response = await client.get("/api/v1/posts?skip=0&limit=10&published_only=true")
        assert page1_response.status_code == 200
        page1_posts = page1_response.json()
        assert len(page1_posts) <= 10

        # Test second page
        page2_response = await client.get("/api/v1/posts?skip=10&limit=10&published_only=true")
        assert page2_response.status_code == 200
        page2_posts = page2_response.json()
        
        # Ensure different posts on different pages
        page1_ids = {p["id"] for p in page1_posts}
        page2_ids = {p["id"] for p in page2_posts}
        assert page1_ids.isdisjoint(page2_ids)  # No overlap

    async def test_unpublished_posts_not_public(self, client: AsyncClient, auth_headers):
        """Test that unpublished posts don't appear in public listings."""
        # Create an unpublished post
        post_data = {
            "title": "Draft Post",
            "content": "This should not appear publicly",
            "published": False
        }
        post_response = await client.post("/api/v1/posts", json=post_data, headers=auth_headers)
        assert post_response.status_code == 200
        draft_post = post_response.json()

        # Check that it doesn't appear in public listing
        public_response = await client.get("/api/v1/posts")
        public_posts = public_response.json()
        
        draft_ids = [p["id"] for p in public_posts if not p.get("published", True)]
        assert draft_post["id"] not in [p["id"] for p in public_posts]

        # Check that it does appear in admin listing
        admin_response = await client.get("/api/v1/posts/admin", headers=auth_headers)
        assert admin_response.status_code == 200
        admin_posts = admin_response.json()
        assert any(p["id"] == draft_post["id"] for p in admin_posts)

    async def test_category_deletion_with_posts(self, client: AsyncClient, auth_headers):
        """Test behavior when deleting a category that has posts."""
        # Create category and post
        category_data = {"name": "To Delete Category"}
        category_response = await client.post("/api/v1/categories", json=category_data, headers=auth_headers)
        category = category_response.json()

        post_data = {
            "title": "Post with Category",
            "content": "This post has a category",
            "category_id": category["id"],
            "published": True
        }
        post_response = await client.post("/api/v1/posts", json=post_data, headers=auth_headers)
        post = post_response.json()

        # Try to delete the category
        delete_response = await client.delete(f"/api/v1/categories/{category['id']}", headers=auth_headers)
        
        # The behavior depends on your business logic
        # Either it should fail (400/409) or succeed and update posts
        assert delete_response.status_code in [200, 400, 409]

    async def test_health_check(self, client: AsyncClient):
        """Test the health check endpoint."""
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    async def test_root_endpoint(self, client: AsyncClient):
        """Test the root endpoint."""
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
