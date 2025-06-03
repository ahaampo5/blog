from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from bson import ObjectId
from datetime import datetime

from core.database import get_database
from core.dependencies import admin_required
from schemas.blog import TagCreate, TagResponse, MessageResponse

router = APIRouter()


@router.get("/", response_model=List[TagResponse])
async def get_tags():
    """Get all tags (public endpoint)"""
    db = get_database()
    tags = await db.tags.find({}).sort("name", 1).to_list(length=None)
    
    return [
        TagResponse(
            id=str(tag["_id"]),
            name=tag["name"],
            created_at=tag["created_at"]
        )
        for tag in tags
    ]


@router.get("/popular", response_model=List[dict])
async def get_popular_tags():
    """Get popular tags with post counts (public endpoint)"""
    db = get_database()
    
    # Aggregate tags from published posts
    pipeline = [
        {"$match": {"is_published": True}},
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 20}
    ]
    
    result = await db.posts.aggregate(pipeline).to_list(length=20)
    
    return [
        {"name": item["_id"], "count": item["count"]}
        for item in result
    ]


@router.post("/", response_model=TagResponse)
async def create_tag(tag_data: TagCreate, current_user: dict = Depends(admin_required)):
    """Create new tag (admin only)"""
    db = get_database()
    
    # Check if tag name already exists
    existing = await db.tags.find_one({"name": tag_data.name})
    if existing:
        raise HTTPException(status_code=400, detail="Tag name already exists")
    
    tag_dict = {
        "name": tag_data.name,
        "created_at": datetime.utcnow()
    }
    
    result = await db.tags.insert_one(tag_dict)
    tag_dict["_id"] = result.inserted_id
    
    return TagResponse(
        id=str(tag_dict["_id"]),
        name=tag_dict["name"],
        created_at=tag_dict["created_at"]
    )


@router.delete("/{tag_id}", response_model=MessageResponse)
async def delete_tag(tag_id: str, current_user: dict = Depends(admin_required)):
    """Delete tag (admin only)"""
    if not ObjectId.is_valid(tag_id):
        raise HTTPException(status_code=400, detail="Invalid tag ID")
    
    db = get_database()
    
    # Get tag name before deletion
    tag = await db.tags.find_one({"_id": ObjectId(tag_id)})
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # Remove tag from all posts
    await db.posts.update_many(
        {"tags": tag["name"]},
        {"$pull": {"tags": tag["name"]}}
    )
    
    # Delete tag
    result = await db.tags.delete_one({"_id": ObjectId(tag_id)})
    
    return {"message": "Tag deleted successfully"}


@router.get("/{tag_id}", response_model=TagResponse)
async def get_tag(tag_id: str):
    """Get single tag (public endpoint)"""
    if not ObjectId.is_valid(tag_id):
        raise HTTPException(status_code=400, detail="Invalid tag ID")
    
    db = get_database()
    tag = await db.tags.find_one({"_id": ObjectId(tag_id)})
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    return TagResponse(
        id=str(tag["_id"]),
        name=tag["name"],
        created_at=tag["created_at"]
    )
