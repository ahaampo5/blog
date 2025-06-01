from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer
from datetime import timedelta

from core.config import settings
from core.security import verify_password, get_password_hash, create_access_token
from core.dependencies import admin_required
from schemas.blog import LoginRequest, TokenResponse, MessageResponse

router = APIRouter()
security = HTTPBearer()


@router.post("/login", response_model=TokenResponse)
async def login(login_data: LoginRequest):
    """Admin login endpoint"""
    # Simple admin authentication (in production, use proper user management)
    if (login_data.username != settings.ADMIN_USERNAME or 
        login_data.password != settings.ADMIN_PASSWORD):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": login_data.username, "role": "admin"},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/verify", response_model=MessageResponse)
async def verify_token(current_user: dict = Depends(admin_required)):
    """Verify admin token"""
    return {"message": f"Token valid for user: {current_user['username']}"}
