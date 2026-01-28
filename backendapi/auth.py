"""
Authentication and authorization using Supabase JWT.
Provides middleware and dependencies for protected routes.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client
from config import settings
from typing import Optional


# Security scheme for JWT bearer tokens
security = HTTPBearer()

# Supabase client for auth verification
auth_client = create_client(settings.supabase_url, settings.supabase_key)


async def validate_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Validate Supabase JWT token and return user ID.
    
    This is a FastAPI dependency that should be used on all protected routes.
    
    Args:
        credentials: HTTP Authorization header with Bearer token
    
    Returns:
        str: User ID extracted from valid token
    
    Raises:
        HTTPException: If token is invalid or expired
    """
    token = credentials.credentials
    
    try:
        # Verify token with Supabase
        user = auth_client.auth.get_user(token)
        
        if not user or not user.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        return user.user.id
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )


def get_current_user_id(user_id: str = Depends(validate_token)) -> str:
    """
    Convenience dependency to get current authenticated user ID.
    
    Usage:
        @app.get("/protected")
        async def protected_route(user_id: str = Depends(get_current_user_id)):
            return {"user_id": user_id}
    """
    return user_id
