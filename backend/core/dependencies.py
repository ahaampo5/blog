from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.security import verify_token
from core.config import settings

security = HTTPBearer()


async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current admin user from JWT token"""
    token = credentials.credentials
    payload = verify_token(token)
    
    username = payload.get("sub")
    role = payload.get("role")
    
    if username != settings.ADMIN_USERNAME or role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return {"username": username, "role": role}


def admin_required(current_user: dict = Depends(get_current_admin)):
    """Dependency to require admin role"""
    return current_user
