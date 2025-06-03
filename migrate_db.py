#!/usr/bin/env python3
"""
Database migration script to update field names for consistency
"""
import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient

# Add backend to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from core.config import settings

async def migrate_database():
    """Update database field names for consistency"""
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    print("Starting database migration...")
    
    try:
        # Update posts collection: published -> is_published
        posts_result = await db.posts.update_many(
            {"published": {"$exists": True}},
            {"$rename": {"published": "is_published"}}
        )
        print(f"Updated {posts_result.modified_count} posts: published -> is_published")
        
        # Update posts collection: view_count -> view_count (already correct)
        # Just ensure the field exists
        await db.posts.update_many(
            {"view_count": {"$exists": False}},
            {"$set": {"view_count": 0}}
        )
        print("Ensured all posts have view_count field")
        
        # Update any categories or tags if needed
        # (These should already be using _id correctly)
        
        print("Database migration completed successfully!")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        raise
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(migrate_database())
