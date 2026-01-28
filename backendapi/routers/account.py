"""
Account-related API endpoints.
Handles balance checking and account information.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from auth import get_current_user_id
from database import db
from models import BalanceResponse, ErrorResponse


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
        balance=user["balance"],
        currency="INR",
        user_id=user_id
    )
