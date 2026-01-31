"""
Account-related API endpoints.
Handles balance checking and account information.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from auth import get_current_user_id
from database import db
from models import (
    BalanceResponse, 
    ErrorResponse, 
    PinSetupRequest, 
    PinVerifyRequest
)


router = APIRouter(prefix="/account", tags=["Account"])


@router.get(
    "/balance",
    response_model=BalanceResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        404: {"model": ErrorResponse, "description": "User not found"}
    },
    summary="Get Account Balance",
    description="Fetch the current balance for the authenticated user."
)
async def get_balance(user_id: str = Depends(get_current_user_id)):
    """
    Get current account balance for authenticated user.
    
    **Security**: Requires valid Supabase JWT token.
    
    **Returns**: Balance in INR and user ID.
    """
    # Fetch user from database
    user = db.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found"
        )
    
    return BalanceResponse(
        balance=float(user["balance"]),
        user_id=user_id
    )
@router.get(
    "/profile",
    summary="Get User Profile",
    description="Fetch profile details for the authenticated user."
)
async def get_profile(user_id: str = Depends(get_current_user_id)):
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Hide PIN hashes in response
    profile = dict(user)
    profile.pop("login_pin", None)
    profile.pop("transfer_pin", None)
    return profile


@router.post(
    "/setup-pin",
    summary="Setup PIN",
    description="Set or update 6-digit login PIN or 4-digit transfer PIN."
)
async def setup_pin(
    request: PinSetupRequest,
    user_id: str = Depends(get_current_user_id)
):
    # Validate PIN length
    if request.type == "login" and len(request.pin) != 6:
        raise HTTPException(status_code=400, detail="Login PIN must be 6 digits")
    if request.type == "transfer" and len(request.pin) != 4:
        raise HTTPException(status_code=400, detail="Transfer PIN must be 4 digits")
    
    success = db.set_user_pin(user_id, request.pin, request.type, request.phone)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save PIN")
    
    return {"message": f"{request.type.capitalize()} PIN updated successfully"}


@router.post(
    "/verify-pin",
    summary="Verify PIN",
    description="Check if the provided PIN is correct."
)
async def verify_pin(
    request: PinVerifyRequest,
    user_id: str = Depends(get_current_user_id)
):
    valid = db.verify_user_pin(user_id, request.pin, request.type)
    if not valid:
        raise HTTPException(status_code=401, detail=f"Invalid {request.type} PIN")
    
    return {"success": True, "message": f"{request.type.capitalize()} PIN verified"}
