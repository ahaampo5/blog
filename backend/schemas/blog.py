from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


class PostCreate(BaseModel):
    title: str
    content: str
    summary: Optional[str] = None
    category_id: Optional[str] = None
    tags: List[str] = []
    featured_image: Optional[str] = None
    is_published: bool = False


class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    category_id: Optional[str] = None
    tags: Optional[List[str]] = None
    featured_image: Optional[str] = None
    is_published: Optional[bool] = None


class PostResponse(BaseModel):
    id: str
    title: str
    content: str
    summary: Optional[str] = None
    category_id: Optional[str] = None
    category: Optional[dict] = None  # Category details
    tags: List[str] = []
    tag_details: Optional[List[dict]] = None  # Tag details
    featured_image: Optional[str] = None
    is_published: bool
    created_at: datetime
    updated_at: datetime
    views: int


class PostListResponse(BaseModel):
    id: str
    title: str
    summary: Optional[str] = None
    content: Optional[str] = None
    category_id: Optional[str] = None
    category: Optional[dict] = None  # Category details
    tags: List[str] = []
    featured_image: Optional[str] = None
    is_published: bool
    created_at: datetime
    views: int


class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class CategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    created_at: datetime


class TagCreate(BaseModel):
    name: str


class TagResponse(BaseModel):
    id: str
    name: str
    created_at: datetime


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class MessageResponse(BaseModel):
    message: str
