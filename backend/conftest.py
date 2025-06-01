"""Test configuration and fixtures."""
import asyncio
import pytest
from httpx import AsyncClient
from mongomock_motor import AsyncMongoMockClient
from fastapi.testclient import TestClient

from main import app
from core.database import get_database
from core.config import settings


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def mock_db():
    """Mock MongoDB database for testing."""
    client = AsyncMongoMockClient()
    db = client[settings.DATABASE_NAME]
    return db


@pytest.fixture
async def app_with_db(mock_db):
    """FastAPI app with mocked database."""
    app.dependency_overrides[get_database] = lambda: mock_db
    yield app
    app.dependency_overrides.clear()


@pytest.fixture
async def client(app_with_db):
    """Async HTTP client for testing."""
    async with AsyncClient(app=app_with_db, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def sync_client():
    """Synchronous test client."""
    return TestClient(app)


@pytest.fixture
async def admin_token(client):
    """Get admin authentication token."""
    # Login to get token using the actual API format
    login_data = {
        "username": "admin",
        "password": "admin123"
    }

    response = await client.post("/api/v1/auth/login", json=login_data)
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        # Fallback for tests that don't require valid auth
        return "dummy-token"


@pytest.fixture
async def auth_headers(admin_token):
    """Authorization headers with admin token."""
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
async def sample_category(client, auth_headers):
    """Create a sample category for testing."""
    category_data = {
        "name": "Test Category",
        "description": "A test category"
    }
    response = await client.post("/api/v1/categories", json=category_data, headers=auth_headers)
    return response.json()


@pytest.fixture
async def sample_tag(client, auth_headers):
    """Create a sample tag for testing."""
    tag_data = {
        "name": "test-tag"
    }
    response = await client.post("/api/v1/tags", json=tag_data, headers=auth_headers)
    return response.json()


@pytest.fixture
async def sample_post(client, auth_headers, sample_category, sample_tag):
    """Create a sample post for testing."""
    post_data = {
        "title": "Test Post",
        "content": "This is a test post content",
        "summary": "Test summary",
        "category_id": sample_category["id"],
        "tags": [sample_tag["id"]],
        "published": True
    }
    response = await client.post("/api/v1/posts", json=post_data, headers=auth_headers)
    return response.json()
