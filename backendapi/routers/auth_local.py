from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from database import db
from auth import get_current_user_id

router = APIRouter(prefix="/auth-local", tags=["Auth (Local/Demo)"])

class LoginPinRequest(BaseModel):
    pin: str = Field(..., min_length=6, max_length=6)
    voice_verified: bool = Field(False)

@router.post("/login")
async def login_with_pin(
    request: LoginPinRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Mocked login with 6-digit PIN and Voice Biometrics.
    Requires JWT (already authenticated via Supabase) to identify the user.
    """
    # 1. Verify Login PIN
    valid_pin = db.verify_user_pin(user_id, request.pin, "login")
    if not valid_pin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid 6-digit login PIN"
        )
    
    # 2. Check Voice Verification (Mocked)
    if not request.voice_verified:
        return {
            "success": False,
            "error": "Voice biometric verification failed",
            "action": "prompt_voice"
        }
    
    return {
        "success": True,
        "message": "Welcome! Account unlocked successfully.",
        "user_id": user_id
    }
