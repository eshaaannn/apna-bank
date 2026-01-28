"""
Rule-based voice intent parser with Hinglish support.
Converts plain text voice commands into structured intents and entities.
"""

import re
from typing import Dict, Any, Optional, Tuple


# ============== Intent Keywords ==============

TRANSFER_KEYWORDS = [
    "send", "transfer", "pay", "give",
    "bhejo", "payment", "de do", "dena"
]

BALANCE_KEYWORDS = [
    "balance", "check", "show", "what is",
    "kitna", "kitne", "dikhao", "batao", "account"
]

BILLPAY_KEYWORDS = [
    "bill", "pay bill", "electricity", "water", "mobile",
    "recharge", "bijli", "pani", "phone"
]

# ============== Hinglish Translation Map ==============

HINGLISH_MAP = {
    "bhejo": "send",
    "kitna": "how much",
    "kitne": "how much",
    "paisa": "money",
    "rupay": "rupees",
    "rupaye": "rupees",
    "dikhao": "show",
    "batao": "tell",
    "de do": "give",
    "dena": "give",
    "bijli": "electricity",
    "pani": "water",
}

# ============== Bill Type Keywords ==============

BILL_TYPES = {
    "electricity": ["electricity", "bijli", "power", "electric"],
    "water": ["water", "pani", "jal"],
    "mobile": ["mobile", "phone", "recharge"],
    "internet": ["internet", "wifi", "broadband"],
    "gas": ["gas", "lpg"],
}


class IntentParser:
    """Rule-based parser for voice commands."""
    
    def __init__(self):
        """Initialize the parser."""
        pass
    
    def normalize_text(self, text: str) -> str:
        """Normalize and translate Hinglish to English."""
        text = text.lower().strip()
        
        # Replace Hinglish words with English equivalents
        for hinglish, english in HINGLISH_MAP.items():
            text = text.replace(hinglish, english)
        
        return text
    
    def detect_intent(self, text: str) -> Tuple[str, float]:
        """
        Detect intent from text.
        Returns (intent_type, confidence_score)
        """
        text = self.normalize_text(text)
        
        # Check for transfer intent
        for keyword in TRANSFER_KEYWORDS:
            if keyword in text:
                return ("transfer", 0.95)
        
        # Check for balance intent
        for keyword in BALANCE_KEYWORDS:
            if keyword in text:
                return ("balance", 0.95)
        
        # Check for bill payment intent
        for keyword in BILLPAY_KEYWORDS:
            if keyword in text:
                return ("billpay", 0.90)
        
        # Unknown intent
        return ("unknown", 0.0)
    
    def extract_amount(self, text: str) -> Optional[float]:
        """Extract amount from text."""
        # Pattern: number followed by optional currency
        patterns = [
            r'(\d+(?:\.\d+)?)\s*(?:rupees|rs|rupay|rupaye|inr)?',
            r'(?:rupees|rs|rupay|rupaye)?\s*(\d+(?:\.\d+)?)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    amount = float(match.group(1))
                    return amount
                except (ValueError, IndexError):
                    continue
        
        return None
    
    def extract_receiver_name(self, text: str) -> Optional[str]:
        """Extract receiver name from text."""
        # Pattern: "to <name>" or "ko <name>"
        patterns = [
            r'(?:to|ko)\s+([a-zA-Z]+)',
            r'([a-zA-Z]+)\s+ko',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return None
    
    def extract_bill_type(self, text: str) -> Optional[str]:
        """Extract bill type from text."""
        text = self.normalize_text(text)
        
        for bill_type, keywords in BILL_TYPES.items():
            for keyword in keywords:
                if keyword in text:
                    return bill_type
        
        return None
    
    def extract_account_number(self, text: str) -> Optional[str]:
        """Extract account/bill number from text."""
        # Pattern: 10-digit number
        match = re.search(r'\b(\d{10})\b', text)
        if match:
            return match.group(1)
        
        return None
    
    def parse(self, text: str) -> Dict[str, Any]:
        """
        Main parsing function.
        Converts text to structured intent with entities.
        """
        # Detect intent
        intent, confidence = self.detect_intent(text)
        
        # Extract entities based on intent
        entities = {}
        action_required = None
        message = None
        
        if intent == "transfer":
            amount = self.extract_amount(text)
            receiver_name = self.extract_receiver_name(text)
            
            entities = {
                "amount": amount,
                "receiver_name": receiver_name
            }
            
            # Determine what's missing
            missing_fields = []
            if not amount:
                missing_fields.append("amount")
            if not receiver_name:
                missing_fields.append("receiver_name")
            
            action_required = {
                "endpoint": "/transaction/transfer",
                "params": {
                    "amount": amount,
                    "receiver_phone": None  # Frontend needs to resolve name to phone
                },
                "missing_fields": missing_fields
            }
            
            if missing_fields:
                message = f"Please provide: {', '.join(missing_fields)}"
        
        elif intent == "balance":
            message = "Fetching your account balance..."
            action_required = {
                "endpoint": "/account/balance",
                "params": {},
                "missing_fields": []
            }
        
        elif intent == "billpay":
            amount = self.extract_amount(text)
            bill_type = self.extract_bill_type(text)
            account_number = self.extract_account_number(text)
            
            entities = {
                "amount": amount,
                "bill_type": bill_type,
                "account_number": account_number
            }
            
            missing_fields = []
            if not amount:
                missing_fields.append("amount")
            if not bill_type:
                missing_fields.append("bill_type")
            if not account_number:
                missing_fields.append("account_number")
            
            action_required = {
                "endpoint": "/transaction/billpay",
                "params": {
                    "amount": amount,
                    "bill_type": bill_type,
                    "account_number": account_number
                },
                "missing_fields": missing_fields
            }
            
            if missing_fields:
                message = f"Please provide: {', '.join(missing_fields)}"
        
        else:
            message = "Sorry, I couldn't understand that. Try saying 'check balance' or 'send money'."
        
        return {
            "intent": intent,
            "confidence": confidence,
            "entities": entities,
            "action_required": action_required,
            "message": message
        }


# Global parser instance
parser = IntentParser()
