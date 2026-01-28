"""
Voice intent processing API endpoint.
Converts voice text into structured intents and action recommendations.
"""

from fastapi import APIRouter, Depends
from auth import get_current_user_id
from intent_parser import parser
from models import VoiceIntentRequest, VoiceIntentResponse


router = APIRouter(prefix="/voice", tags=["Voice"])


@router.post(
    "/intent",
    response_model=VoiceIntentResponse,
    summary="Parse Voice Intent",
    description="Convert transcribed voice text into structured intent with entities and action recommendations."
)
async def parse_voice_intent(
    request: VoiceIntentRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Parse voice command into structured intent.
    
    **Input**: Plain text (already transcribed from speech)
    
    **Output**: 
    - Intent type (transfer, balance, billpay, unknown)
    - Confidence score
    - Extracted entities (amount, receiver, bill type, etc.)
    - Action required (which endpoint to call next)
    - Missing fields (if any)
    
    **Security**: Requires valid JWT.
    
    **Examples**:
    - "Send 200 rupees to Ramesh" → transfer intent
    - "Check my balance" → balance intent
    - "Pay electricity bill 500" → billpay intent
    - "Mere account mein kitna paisa hai" → balance intent (Hinglish)
    """
    # Parse the text
    result = parser.parse(request.text)
    
    return VoiceIntentResponse(
        intent=result["intent"],
        confidence=result["confidence"],
        entities=result["entities"],
        action_required=result.get("action_required"),
        message=result.get("message")
    )
