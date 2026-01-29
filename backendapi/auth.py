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
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> str:
    """
    Validate Supabase JWT token or bypass if missing (Dev Mode).
    
    Returns:
        str: Real User ID from token or a Default Test User ID.
    """
    # 1. If NO token is provided, use the Bypass (For easy testing)
    if not credentials:
        # Actual Test User ID from our setup scripts
        DEFAULT_USER_ID = "e16aa1c7-bdc9-46cb-a15a-d9f6e8eb58ae"
        print(f"\n⚠️  [AUTH BYPASS] No token provided. Using Default Test User: {DEFAULT_USER_ID}")
        return DEFAULT_USER_ID

    # 2. If a token IS provided, validate it normally
    token = credentials.credentials
    
    try:
        user = auth_client.auth.get_user(token)
        
        if not user or not user.user:
            # If they provided a fake token, we still block them
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token. Remove token to use Bypass mode.",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        return user.user.id
        
    except Exception as e:
        # If validaton crashes, we show error
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
