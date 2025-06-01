from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from core.database import get_database
from core.dependencies import admin_required
from models.blog import PostModel
from schemas.blog import (
    PostCreate, PostUpdate, PostResponse, PostListResponse, MessageResponse
)

router = APIRouter()


@router.get("/", response_model=List[PostListResponse])
async def get_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    published_only: bool = Query(True),
    search: Optional[str] = Query(None)
):
    """Get posts list (public endpoint)"""
    db = get_database()
    
    # Build query
    query = {}
    if published_only:
        query["published"] = True
    if category:
        query["category_name"] = category
    if tag:
        query["tags"] = {"$in": [tag]}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}},
            {"summary": {"$regex": search, "$options": "i"}}
        ]
    
    posts = await db.posts.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    return [
        PostListResponse(
            id=str(post["_id"]),
            title=post["title"],
            summary=post.get("summary"),
            category_name=post.get("category_name"),
            tags=post.get("tags", []),
            featured_image=post.get("featured_image"),
            published=post["published"],
            created_at=post["created_at"],
            view_count=post.get("view_count", 0)
        )
        for post in posts
    ]


@router.get("/admin", response_model=List[PostListResponse])
async def get_admin_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(admin_required)
):
    """Get all posts for admin (including unpublished)"""
    db = get_database()
    
    posts = await db.posts.find({}).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    return [
        PostListResponse(
            id=str(post["_id"]),
            title=post["title"],
            summary=post.get("summary"),
            category_name=post.get("category_name"),
            tags=post.get("tags", []),
            featured_image=post.get("featured_image"),
            published=post["published"],
            created_at=post["created_at"],
            view_count=post.get("view_count", 0)
        )
        for post in posts
    ]


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: str):
    """Get single post (public endpoint)"""
    if not ObjectId.is_valid(post_id):
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    db = get_database()
    post = await db.posts.find_one({"_id": ObjectId(post_id)})
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Only show published posts to public
    if not post.get("published", False):
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Increment view count
    await db.posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$inc": {"view_count": 1}}
    )
    post["view_count"] = post.get("view_count", 0) + 1
    
    return PostResponse(
        id=str(post["_id"]),
        title=post["title"],
        content=post["content"],
        summary=post.get("summary"),
        category_id=str(post["category_id"]) if post.get("category_id") else None,
        category_name=post.get("category_name"),
        tags=post.get("tags", []),
        featured_image=post.get("featured_image"),
        published=post["published"],
        created_at=post["created_at"],
        updated_at=post["updated_at"],
        view_count=post["view_count"]
    )


@router.get("/admin/{post_id}", response_model=PostResponse)
async def get_admin_post(post_id: str, current_user: dict = Depends(admin_required)):
    """Get single post for admin (including unpublished)"""
    if not ObjectId.is_valid(post_id):
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    db = get_database()
    post = await db.posts.find_one({"_id": ObjectId(post_id)})
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return PostResponse(
        id=str(post["_id"]),
        title=post["title"],
        content=post["content"],
        summary=post.get("summary"),
        category_id=str(post["category_id"]) if post.get("category_id") else None,
        category_name=post.get("category_name"),
        tags=post.get("tags", []),
        featured_image=post.get("featured_image"),
        published=post["published"],
        created_at=post["created_at"],
        updated_at=post["updated_at"],
        view_count=post.get("view_count", 0)
    )


@router.post("/", response_model=PostResponse)
async def create_post(post_data: PostCreate, current_user: dict = Depends(admin_required)):
    """Create new post (admin only)"""
    db = get_database()
    
    # Get category name if category_id is provided
    category_name = None
    if post_data.category_id:
        if ObjectId.is_valid(post_data.category_id):
            category = await db.categories.find_one({"_id": ObjectId(post_data.category_id)})
            if category:
                category_name = category["name"]
    
    post_dict = {
        "title": post_data.title,
        "content": post_data.content,
        "summary": post_data.summary,
        "category_id": ObjectId(post_data.category_id) if post_data.category_id and ObjectId.is_valid(post_data.category_id) else None,
        "category_name": category_name,
        "tags": post_data.tags,
        "featured_image": post_data.featured_image,
        "published": post_data.published,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "view_count": 0
    }
    
    result = await db.posts.insert_one(post_dict)
    post_dict["_id"] = result.inserted_id
    
    return PostResponse(
        id=str(post_dict["_id"]),
        title=post_dict["title"],
        content=post_dict["content"],
        summary=post_dict["summary"],
        category_id=str(post_dict["category_id"]) if post_dict["category_id"] else None,
        category_name=post_dict["category_name"],
        tags=post_dict["tags"],
        featured_image=post_dict["featured_image"],
        published=post_dict["published"],
        created_at=post_dict["created_at"],
        updated_at=post_dict["updated_at"],
        view_count=post_dict["view_count"]
    )


@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: str, 
    post_data: PostUpdate, 
    current_user: dict = Depends(admin_required)
):
    """Update post (admin only)"""
    if not ObjectId.is_valid(post_id):
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    db = get_database()
    
    # Check if post exists
    existing_post = await db.posts.find_one({"_id": ObjectId(post_id)})
    if not existing_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Prepare update data
    update_data = {"updated_at": datetime.utcnow()}
    
    for field, value in post_data.dict(exclude_unset=True).items():
        if field == "category_id" and value:
            if ObjectId.is_valid(value):
                # Get category name
                category = await db.categories.find_one({"_id": ObjectId(value)})
                if category:
                    update_data["category_id"] = ObjectId(value)
                    update_data["category_name"] = category["name"]
        else:
            update_data[field] = value
    
    await db.posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": update_data}
    )
    
    # Get updated post
    updated_post = await db.posts.find_one({"_id": ObjectId(post_id)})
    
    return PostResponse(
        id=str(updated_post["_id"]),
        title=updated_post["title"],
        content=updated_post["content"],
        summary=updated_post.get("summary"),
        category_id=str(updated_post["category_id"]) if updated_post.get("category_id") else None,
        category_name=updated_post.get("category_name"),
        tags=updated_post.get("tags", []),
        featured_image=updated_post.get("featured_image"),
        published=updated_post["published"],
        created_at=updated_post["created_at"],
        updated_at=updated_post["updated_at"],
        view_count=updated_post.get("view_count", 0)
    )


@router.delete("/{post_id}", response_model=MessageResponse)
async def delete_post(post_id: str, current_user: dict = Depends(admin_required)):
    """Delete post (admin only)"""
    if not ObjectId.is_valid(post_id):
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    db = get_database()
    
    result = await db.posts.delete_one({"_id": ObjectId(post_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return {"message": "Post deleted successfully"}
