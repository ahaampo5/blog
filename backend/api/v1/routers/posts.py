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


@router.get("/public", response_model=dict)
async def get_public_posts(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    category: Optional[str] = Query(None),
    tags: Optional[List[str]] = Query(None),
    search: Optional[str] = Query(None)
):
    """Get published posts with pagination (public endpoint)"""
    db = get_database()
    
    # Calculate skip value (page is 1-based in frontend)
    skip = (page - 1) * size
    
    # Build query for published posts only
    query = {"is_published": True}
    
    if category:
        # Category filter by name or ID
        if ObjectId.is_valid(category):
            query["category_id"] = ObjectId(category)
        else:
            query["category_name"] = category
    if tags:
        query["tags"] = {"$in": tags}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}},
            {"summary": {"$regex": search, "$options": "i"}}
        ]
    
    # Get total count for pagination
    total = await db.posts.count_documents(query)
    
    # Get posts with pagination and populate category/tag details
    posts = await db.posts.find(query).sort("created_at", -1).skip(skip).limit(size).to_list(length=size)
    
    items = []
    for post in posts:
        # Get category details
        category = None
        if post.get("category_id"):
            category_doc = await db.categories.find_one({"_id": post["category_id"]})
            if category_doc:
                category = {
                    "id": str(category_doc["_id"]),
                    "name": category_doc["name"],
                    "description": category_doc.get("description")
                }
        
        items.append(PostListResponse(
            id=str(post["_id"]),
            title=post["title"],
            summary=post.get("summary"),
            content=post.get("content"),
            category_id=str(post["category_id"]) if post.get("category_id") else None,
            category=category,
            tags=post.get("tags", []),
            featured_image=post.get("featured_image"),
            is_published=post["is_published"],
            created_at=post["created_at"],
            views=post.get("view_count", 0)
        ))
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size
    }


@router.get("/public/{post_id}", response_model=PostResponse)
async def get_public_post(post_id: str):
    """Get single published post (public endpoint)"""
    if not ObjectId.is_valid(post_id):
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    db = get_database()
    post = await db.posts.find_one({"_id": ObjectId(post_id), "is_published": True})
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Increment view count
    await db.posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$inc": {"view_count": 1}}
    )
    post["view_count"] = post.get("view_count", 0) + 1
    
    # Get category details
    category = None
    if post.get("category_id"):
        category_doc = await db.categories.find_one({"_id": post["category_id"]})
        if category_doc:
            category = {
                "id": str(category_doc["_id"]),
                "name": category_doc["name"],
                "description": category_doc.get("description")
            }
    
    # Get tag details
    tag_details = []
    if post.get("tags"):
        tag_docs = await db.tags.find({"name": {"$in": post["tags"]}}).to_list(length=None)
        tag_details = [
            {
                "id": str(tag["_id"]),
                "name": tag["name"],
                "created_at": tag["created_at"]
            }
            for tag in tag_docs
        ]
    
    return PostResponse(
        id=str(post["_id"]),
        title=post["title"],
        content=post["content"],
        summary=post.get("summary"),
        category_id=str(post["category_id"]) if post.get("category_id") else None,
        category=category,
        tags=post.get("tags", []),
        tag_details=tag_details,
        featured_image=post.get("featured_image"),
        is_published=post["is_published"],
        created_at=post["created_at"],
        updated_at=post["updated_at"],
        views=post["view_count"]
    )


@router.get("/", response_model=dict)
async def get_posts(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(admin_required)
):
    """Get all posts with pagination (admin only)"""
    db = get_database()
    
    # Calculate skip value
    skip = (page - 1) * size
    
    # Get total count
    total = await db.posts.count_documents({})
    
    # Get posts with pagination and populate category details
    posts = await db.posts.find({}).sort("created_at", -1).skip(skip).limit(size).to_list(length=size)
    
    items = []
    for post in posts:
        # Get category details
        category = None
        if post.get("category_id"):
            category_doc = await db.categories.find_one({"_id": post["category_id"]})
            if category_doc:
                category = {
                    "id": str(category_doc["_id"]),
                    "name": category_doc["name"],
                    "description": category_doc.get("description")
                }
        
        items.append(PostListResponse(
            id=str(post["_id"]),
            title=post["title"],
            summary=post.get("summary"),
            content=post.get("content"),
            category_id=str(post["category_id"]) if post.get("category_id") else None,
            category=category,
            tags=post.get("tags", []),
            featured_image=post.get("featured_image"),
            is_published=post["is_published"],
            created_at=post["created_at"],
            views=post.get("view_count", 0)
        ))
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size
    }


@router.get("/admin", response_model=List[PostListResponse])
async def get_admin_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(admin_required)
):
    """Get all posts for admin (including unpublished)"""
    db = get_database()
    
    posts = await db.posts.find({}).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    result = []
    for post in posts:
        # Get category details
        category = None
        if post.get("category_id"):
            category_doc = await db.categories.find_one({"_id": post["category_id"]})
            if category_doc:
                category = {
                    "id": str(category_doc["_id"]),
                    "name": category_doc["name"],
                    "description": category_doc.get("description")
                }
        
        result.append(PostListResponse(
            id=str(post["_id"]),
            title=post["title"],
            summary=post.get("summary"),
            content=post.get("content"),
            category_id=str(post["category_id"]) if post.get("category_id") else None,
            category=category,
            tags=post.get("tags", []),
            featured_image=post.get("featured_image"),
            is_published=post["is_published"],
            created_at=post["created_at"],
            views=post.get("view_count", 0)
        ))
    
    return result


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
    if not post.get("is_published", False):
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Increment view count
    await db.posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$inc": {"view_count": 1}}
    )
    post["view_count"] = post.get("view_count", 0) + 1
    
    # Get category details
    category = None
    if post.get("category_id"):
        category_doc = await db.categories.find_one({"_id": post["category_id"]})
        if category_doc:
            category = {
                "id": str(category_doc["_id"]),
                "name": category_doc["name"],
                "description": category_doc.get("description")
            }
    
    # Get tag details
    tag_details = []
    if post.get("tags"):
        tag_docs = await db.tags.find({"name": {"$in": post["tags"]}}).to_list(length=None)
        tag_details = [
            {
                "id": str(tag["_id"]),
                "name": tag["name"],
                "created_at": tag["created_at"]
            }
            for tag in tag_docs
        ]
    
    return PostResponse(
        id=str(post["_id"]),
        title=post["title"],
        content=post["content"],
        summary=post.get("summary"),
        category_id=str(post["category_id"]) if post.get("category_id") else None,
        category=category,
        tags=post.get("tags", []),
        tag_details=tag_details,
        featured_image=post.get("featured_image"),
        is_published=post["is_published"],
        created_at=post["created_at"],
        updated_at=post["updated_at"],
        views=post["view_count"]
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
    
    # Get category details
    category = None
    if post.get("category_id"):
        category_doc = await db.categories.find_one({"_id": post["category_id"]})
        if category_doc:
            category = {
                "id": str(category_doc["_id"]),
                "name": category_doc["name"],
                "description": category_doc.get("description")
            }
    
    # Get tag details
    tag_details = []
    if post.get("tags"):
        tag_docs = await db.tags.find({"name": {"$in": post["tags"]}}).to_list(length=None)
        tag_details = [
            {
                "id": str(tag["_id"]),
                "name": tag["name"],
                "created_at": tag["created_at"]
            }
            for tag in tag_docs
        ]
    
    return PostResponse(
        id=str(post["_id"]),
        title=post["title"],
        content=post["content"],
        summary=post.get("summary"),
        category_id=str(post["category_id"]) if post.get("category_id") else None,
        category=category,
        tags=post.get("tags", []),
        tag_details=tag_details,
        featured_image=post.get("featured_image"),
        is_published=post["is_published"],
        created_at=post["created_at"],
        updated_at=post["updated_at"],
        views=post.get("view_count", 0)
    )


@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
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
        "is_published": post_data.is_published,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "view_count": 0
    }
    
    result = await db.posts.insert_one(post_dict)
    post_dict["_id"] = result.inserted_id
    
    # Get category details
    category = None
    if post_dict["category_id"]:
        category_doc = await db.categories.find_one({"_id": post_dict["category_id"]})
        if category_doc:
            category = {
                "id": str(category_doc["_id"]),
                "name": category_doc["name"],
                "description": category_doc.get("description")
            }
    
    # Get tag details
    tag_details = []
    if post_dict["tags"]:
        tag_docs = await db.tags.find({"name": {"$in": post_dict["tags"]}}).to_list(length=None)
        tag_details = [
            {
                "id": str(tag["_id"]),
                "name": tag["name"],
                "created_at": tag["created_at"]
            }
            for tag in tag_docs
        ]
    
    return PostResponse(
        id=str(post_dict["_id"]),
        title=post_dict["title"],
        content=post_dict["content"],
        summary=post_dict["summary"],
        category_id=str(post_dict["category_id"]) if post_dict["category_id"] else None,
        category=category,
        tags=post_dict["tags"],
        tag_details=tag_details,
        featured_image=post_dict["featured_image"],
        is_published=post_dict["is_published"],
        created_at=post_dict["created_at"],
        updated_at=post_dict["updated_at"],
        views=post_dict["view_count"]
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
        elif field == "is_published":
            update_data["is_published"] = value
        else:
            update_data[field] = value
    
    await db.posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": update_data}
    )
    
    # Get updated post
    updated_post = await db.posts.find_one({"_id": ObjectId(post_id)})
    
    # Get category details
    category = None
    if updated_post.get("category_id"):
        category_doc = await db.categories.find_one({"_id": updated_post["category_id"]})
        if category_doc:
            category = {
                "id": str(category_doc["_id"]),
                "name": category_doc["name"],
                "description": category_doc.get("description")
            }
    
    # Get tag details
    tag_details = []
    if updated_post.get("tags"):
        tag_docs = await db.tags.find({"name": {"$in": updated_post["tags"]}}).to_list(length=None)
        tag_details = [
            {
                "id": str(tag["_id"]),
                "name": tag["name"],
                "created_at": tag["created_at"]
            }
            for tag in tag_docs
        ]
    
    return PostResponse(
        id=str(updated_post["_id"]),
        title=updated_post["title"],
        content=updated_post["content"],
        summary=updated_post.get("summary"),
        category_id=str(updated_post["category_id"]) if updated_post.get("category_id") else None,
        category=category,
        tags=updated_post.get("tags", []),
        tag_details=tag_details,
        featured_image=updated_post.get("featured_image"),
        is_published=updated_post["is_published"],
        created_at=updated_post["created_at"],
        updated_at=updated_post["updated_at"],
        views=updated_post.get("view_count", 0)
    )


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: str, current_user: dict = Depends(admin_required)):
    """Delete post (admin only)"""
    if not ObjectId.is_valid(post_id):
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    db = get_database()
    
    result = await db.posts.delete_one({"_id": ObjectId(post_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return  # 204는 본문 없이 반환
