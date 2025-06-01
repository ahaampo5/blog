from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from bson import ObjectId
from datetime import datetime

from core.database import get_database
from core.dependencies import admin_required
from schemas.blog import CategoryCreate, CategoryUpdate, CategoryResponse, MessageResponse

router = APIRouter()


@router.get("/", response_model=List[CategoryResponse])
async def get_categories():
    """Get all categories (public endpoint)"""
    db = get_database()
    categories = await db.categories.find({}).sort("name", 1).to_list(length=None)
    
    return [
        CategoryResponse(
            id=str(category["_id"]),
            name=category["name"],
            description=category.get("description"),
            created_at=category["created_at"]
        )
        for category in categories
    ]


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: str):
    """Get single category (public endpoint)"""
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=400, detail="Invalid category ID")
    
    db = get_database()
    category = await db.categories.find_one({"_id": ObjectId(category_id)})
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return CategoryResponse(
        id=str(category["_id"]),
        name=category["name"],
        description=category.get("description"),
        created_at=category["created_at"]
    )


@router.post("/", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate, 
    current_user: dict = Depends(admin_required)
):
    """Create new category (admin only)"""
    db = get_database()
    
    # Check if category name already exists
    existing = await db.categories.find_one({"name": category_data.name})
    if existing:
        raise HTTPException(status_code=400, detail="Category name already exists")
    
    category_dict = {
        "name": category_data.name,
        "description": category_data.description,
        "created_at": datetime.utcnow()
    }
    
    result = await db.categories.insert_one(category_dict)
    category_dict["_id"] = result.inserted_id
    
    return CategoryResponse(
        id=str(category_dict["_id"]),
        name=category_dict["name"],
        description=category_dict["description"],
        created_at=category_dict["created_at"]
    )


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    category_data: CategoryUpdate,
    current_user: dict = Depends(admin_required)
):
    """Update category (admin only)"""
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=400, detail="Invalid category ID")
    
    db = get_database()
    
    # Check if category exists
    existing_category = await db.categories.find_one({"_id": ObjectId(category_id)})
    if not existing_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if new name already exists (if name is being updated)
    if category_data.name and category_data.name != existing_category["name"]:
        name_exists = await db.categories.find_one({"name": category_data.name})
        if name_exists:
            raise HTTPException(status_code=400, detail="Category name already exists")
    
    # Prepare update data
    update_data = {}
    for field, value in category_data.dict(exclude_unset=True).items():
        update_data[field] = value
    
    if update_data:
        await db.categories.update_one(
            {"_id": ObjectId(category_id)},
            {"$set": update_data}
        )
        
        # Update category name in posts if name changed
        if "name" in update_data:
            await db.posts.update_many(
                {"category_id": ObjectId(category_id)},
                {"$set": {"category_name": update_data["name"]}}
            )
    
    # Get updated category
    updated_category = await db.categories.find_one({"_id": ObjectId(category_id)})
    
    return CategoryResponse(
        id=str(updated_category["_id"]),
        name=updated_category["name"],
        description=updated_category.get("description"),
        created_at=updated_category["created_at"]
    )


@router.delete("/{category_id}", response_model=MessageResponse)
async def delete_category(
    category_id: str, 
    current_user: dict = Depends(admin_required)
):
    """Delete category (admin only)"""
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=400, detail="Invalid category ID")
    
    db = get_database()
    
    # Check if category is used in posts
    posts_with_category = await db.posts.count_documents({"category_id": ObjectId(category_id)})
    if posts_with_category > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete category. It is used in {posts_with_category} posts."
        )
    
    result = await db.categories.delete_one({"_id": ObjectId(category_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category deleted successfully"}
