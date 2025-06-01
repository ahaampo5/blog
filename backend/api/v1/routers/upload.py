from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from typing import List
import os
import uuid
from PIL import Image
import aiofiles

from core.config import settings
from core.dependencies import admin_required
from schemas.blog import MessageResponse

router = APIRouter()

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".webm", ".ogg"}


def get_file_extension(filename: str) -> str:
    """Get file extension in lowercase"""
    return os.path.splitext(filename)[1].lower()


def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    ext = get_file_extension(filename)
    return ext in ALLOWED_IMAGE_EXTENSIONS or ext in ALLOWED_VIDEO_EXTENSIONS


def generate_filename(original_filename: str) -> str:
    """Generate unique filename"""
    ext = get_file_extension(original_filename)
    return f"{uuid.uuid4()}{ext}"


async def resize_image(file_path: str, max_width: int = 1200, max_height: int = 800):
    """Resize image if it's too large"""
    try:
        with Image.open(file_path) as img:
            # Convert RGBA to RGB if necessary
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            # Calculate new size
            ratio = min(max_width / img.width, max_height / img.height)
            if ratio < 1:
                new_width = int(img.width * ratio)
                new_height = int(img.height * ratio)
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                img.save(file_path, "JPEG", quality=85, optimize=True)
    except Exception as e:
        # If image processing fails, just keep the original
        pass


@router.post("/image", response_model=dict)
async def upload_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(admin_required)
):
    """Upload image file (admin only)"""
    
    # Check file size
    if file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE} bytes"
        )
    
    # Check file extension
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail="File type not allowed. Allowed types: " + 
                   ", ".join(ALLOWED_IMAGE_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS)
        )
    
    # Generate unique filename
    filename = generate_filename(file.filename)
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    # Save file
    try:
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Resize image if it's an image file
        ext = get_file_extension(filename)
        if ext in ALLOWED_IMAGE_EXTENSIONS:
            await resize_image(file_path)
        
        # Return file URL
        file_url = f"/uploads/{filename}"
        return {
            "filename": filename,
            "url": file_url,
            "original_filename": file.filename,
            "size": len(content)
        }
        
    except Exception as e:
        # Clean up file if something went wrong
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail="Failed to save file")


@router.post("/multiple", response_model=List[dict])
async def upload_multiple_files(
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(admin_required)
):
    """Upload multiple files (admin only)"""
    
    if len(files) > 10:  # Limit to 10 files
        raise HTTPException(status_code=400, detail="Too many files. Maximum 10 files allowed")
    
    results = []
    
    for file in files:
        try:
            # Check file size
            if file.size > settings.MAX_FILE_SIZE:
                results.append({
                    "filename": file.filename,
                    "success": False,
                    "error": f"File too large. Maximum size is {settings.MAX_FILE_SIZE} bytes"
                })
                continue
            
            # Check file extension
            if not is_allowed_file(file.filename):
                results.append({
                    "filename": file.filename,
                    "success": False,
                    "error": "File type not allowed"
                })
                continue
            
            # Generate unique filename
            filename = generate_filename(file.filename)
            file_path = os.path.join(settings.UPLOAD_DIR, filename)
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            # Resize image if it's an image file
            ext = get_file_extension(filename)
            if ext in ALLOWED_IMAGE_EXTENSIONS:
                await resize_image(file_path)
            
            # Add to results
            file_url = f"/uploads/{filename}"
            results.append({
                "filename": filename,
                "url": file_url,
                "original_filename": file.filename,
                "size": len(content),
                "success": True
            })
            
        except Exception as e:
            results.append({
                "filename": file.filename,
                "success": False,
                "error": "Failed to save file"
            })
    
    return results


@router.delete("/{filename}", response_model=MessageResponse)
async def delete_file(filename: str, current_user: dict = Depends(admin_required)):
    """Delete uploaded file (admin only)"""
    
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        os.remove(file_path)
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete file")
