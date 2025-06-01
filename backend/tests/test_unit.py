"""Unit tests for core functionality."""
import pytest
from datetime import datetime, timedelta
from fastapi import HTTPException
from pydantic import ValidationError

from core.security import create_access_token, verify_password, get_password_hash, verify_token
from schemas.blog import PostCreate, CategoryCreate, TagCreate


class TestSecurityFunctions:
    """Test security utility functions."""

    def test_password_hashing(self):
        """Test password hashing and verification."""
        password = "test_password_123"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert verify_password(password, hashed) is True
        assert verify_password("wrong_password", hashed) is False

    def test_access_token_creation(self):
        """Test JWT token creation."""
        data = {"sub": "test_user", "admin": True}
        token = create_access_token(data=data)
        
        assert isinstance(token, str)
        assert len(token) > 0

    def test_access_token_with_expiry(self):
        """Test JWT token creation with custom expiry."""
        data = {"sub": "test_user"}
        expires_delta = timedelta(minutes=30)
        token = create_access_token(data=data, expires_delta=expires_delta)
        
        assert isinstance(token, str)
        assert len(token) > 0

    def test_token_verification_valid(self):
        """Test token verification with valid token."""
        data = {"sub": "test_user", "admin": True}
        token = create_access_token(data=data)
        
        payload = verify_token(token)
        assert payload is not None
        assert payload["sub"] == "test_user"
        assert payload["admin"] is True

    def test_token_verification_invalid(self):
        """Test token verification with invalid token."""
        invalid_token = "invalid.token.here"
        
        with pytest.raises(HTTPException) as exc_info:
            verify_token(invalid_token)
        
        assert exc_info.value.status_code == 401
        assert "Could not validate credentials" in exc_info.value.detail


class TestSchemas:
    """Test Pydantic schemas."""

    def test_post_create_schema_valid(self):
        """Test PostCreate schema with valid data."""
        post_data = {
            "title": "Test Post",
            "content": "This is test content",
            "summary": "Test summary",
            "category_id": "507f1f77bcf86cd799439011",
            "tags": ["tag1", "tag2"],
            "featured_image": "image.jpg",
            "published": True
        }
        
        post = PostCreate(**post_data)
        assert post.title == "Test Post"
        assert post.content == "This is test content"
        assert post.published is True
        assert len(post.tags) == 2

    def test_post_create_schema_minimal(self):
        """Test PostCreate schema with minimal required data."""
        post_data = {
            "title": "Minimal Post",
            "content": "Content only"
        }
        
        post = PostCreate(**post_data)
        assert post.title == "Minimal Post"
        assert post.content == "Content only"
        assert post.published is False  # Default value
        assert post.tags == []  # Default value

    def test_category_create_schema_valid(self):
        """Test CategoryCreate schema with valid data."""
        category_data = {
            "name": "Technology",
            "description": "Tech related posts"
        }
        
        category = CategoryCreate(**category_data)
        assert category.name == "Technology"
        assert category.description == "Tech related posts"

    def test_category_create_schema_minimal(self):
        """Test CategoryCreate schema with minimal data."""
        category_data = {
            "name": "Minimal Category"
        }
        
        category = CategoryCreate(**category_data)
        assert category.name == "Minimal Category"
        assert category.description is None

    def test_tag_create_schema_valid(self):
        """Test TagCreate schema with valid data."""
        tag_data = {
            "name": "python"
        }
        
        tag = TagCreate(**tag_data)
        assert tag.name == "python"

    @pytest.mark.parametrize("invalid_data", [
        {},  # Missing required fields
        {"title": "Valid"},  # Missing content field
    ])
    def test_post_create_schema_invalid(self, invalid_data):
        """Test PostCreate schema with invalid data."""
        with pytest.raises(ValidationError):
            PostCreate(**invalid_data)


class TestDateUtilities:
    """Test date utility functions."""

    def test_datetime_aware(self):
        """Test that datetime objects are timezone aware when needed."""
        now = datetime.utcnow()
        assert isinstance(now, datetime)
        
        # Test that we can serialize datetime to string
        date_str = now.isoformat()
        assert isinstance(date_str, str)
        assert "T" in date_str
