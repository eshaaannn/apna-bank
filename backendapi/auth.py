"""
Authentication and authorization using Supabase JWT.
Provides middleware and dependencies for protected routes.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client
from config import settings
from typing import Optional, Dict, Any
from database import db


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
        # Actual Test User ID from database
        DEFAULT_USER_ID = "14005a20-a9f4-4747-b92e-69089d287901"
        print(f"\n⚠️  [AUTH BYPASS] No token provided. Using Default Test User: {DEFAULT_USER_ID}")
        return DEFAULT_USER_ID

    # 2. If a token IS provided, validate it normally
    token = credentials.credentials
    
    try:
        # Validate with Supabase
        user_response = auth_client.auth.get_user(token)
        
        if not user_response or not user_response.user:
            # If they provided a fake token, we still block them
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token. Remove token to use Bypass mode.",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        user_id = user_response.user.id
        
        # AUTO-SYNC: Ensure user exists in our local DB table with default balance
        db.sync_user(user_id, user_response.user.email)
        
        return user_id
        
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


def verify_login_pin(user_id: str, pin: str) -> bool:
    """
    Verify the 6-digit login PIN for a user.
    """
    return db.verify_user_pin(user_id, pin, "login")


def mock_voice_unlock(user_id: str, audio_sample: Optional[str] = None) -> Dict[str, Any]:
    """
    Mocked voice biometric verification.
    In a real app, this would process the audio sample against a stored voiceprint.
    """
    # For hackathon/demo, we'll return a success signal
    # This simulates a successful "My voice is my password" check
    return {
        "success": True,
        "confidence": 0.98,
        "message": "Voice verified successfully"
    }
