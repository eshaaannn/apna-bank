"""
Rule-based voice intent parser with Hinglish support.
Converts plain text voice commands into structured intents and entities.
"""

import re
from typing import Dict, Any, Optional, Tuple


# ============== Intent Keywords ==============

TRANSFER_KEYWORDS = [
    "send", "transfer", "pay", "give", "bhejo", "transfer", 
    "payment", "de do", "dena", "paisa bhejo", "rupay bhejo",
    "daal do", "transfer kar do"
]

BALANCE_KEYWORDS = [
    "balance", "check", "show", "what is", "kitna", "kitne", 
    "dikhao", "batao", "account", "paisa batao", "kitna hai"
]

BILLPAY_KEYWORDS = [
    "bill", "pay bill", "electricity", "water", "mobile",
    "recharge", "bijli", "pani", "phone", "bharna", "jama karna"
]

CONFIRM_KEYWORDS = [
    "yes", "confirm", "proceed", "ha", "haji", "thik hai", "ok", "done", "confirm karo", "kar do"
]

CANCEL_KEYWORDS = [
    "no", "cancel", "stop", "nhi", "na", "cancel kar do"
]

# ============== Hinglish Translation Map ==============

HINGLISH_MAP = {
    "bhejo": "send",
    "kitna": "how much",
    "kitne": "how much",
    "paisa": "money",
    "paise": "money",
    "rupay": "rupees",
    "rupaye": "rupees",
    "dikhao": "show",
    "batao": "tell",
    "de do": "give",
    "dena": "give",
    "bijli": "electricity",
    "pani": "water",
    "bharna": "pay",
    "jama": "pay",
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
        
        # Check for confirmation
        for keyword in CONFIRM_KEYWORDS:
            if keyword == text: # Strict check for "yes"
                return ("confirm", 1.0)
            if f" {keyword}" in text or f"{keyword} " in text:
                return ("confirm", 0.9)

        # Check for cancel
        for keyword in CANCEL_KEYWORDS:
            if keyword == text:
                return ("cancel", 1.0)
        
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
        """Extract receiver name or phone from text."""
        # Pattern: "to <name/phone>" or "ko <name/phone>"
        # Allow numbers and basic names
        patterns = [
            r'(?:to|ko)\s+([a-zA-Z0-9]+)',
            r'([a-zA-Z0-9]+)\s+ko',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                name = match.group(1).strip()
                # Resolve common demo names to the receiver's phone
                if any(k in name.lower() for k in ["sharma", "receiver", "rahul", "dost", "friend"]):
                    return "8888888888"
                return name
        
        return None

    def extract_pin(self, text: str) -> Optional[str]:
        """Extract 4-6 digit PIN from text, handling spaces."""
        # Find all sequences of 4-6 digits with optional spaces
        # Match boundaries to avoid part of phone numbers unless they are explicitly PIN-like
        # We also look for digits separated by spaces like "1 2 3 4"
        
        # Strategy: find all digits and check if they form a 4-6 digit sequence
        # But we only want sequences that are likely PINs
        # Let's use a regex that looks for 4-6 digits possibly with spaces
        matches = re.finditer(r'(?:\d\s*){4,6}', text)
        for match in matches:
            found = match.group(0).strip()
            # Clean spaces
            clean = re.sub(r'\s+', '', found)
            if 4 <= len(clean) <= 6:
                # Basic heuristic: if it's 10 digits, it might be a phone number, so we skipped it by {4,6}
                return clean
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
                    "receiver_phone": receiver_name if (receiver_name and receiver_name.isdigit()) else "8888888888"
                },
                "missing_fields": missing_fields
            }
            
            if missing_fields:
                message = f"Please provide: {', '.join(missing_fields)}"
            else:
                receiver_display = "Sharma" if receiver_name == "8888888888" else receiver_name
                message = f"Confirming transfer of ₹{amount} to {receiver_display}. Say yes to proceed."
        
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
        
        # Global entity extraction: PIN (can be said anytime)
        pin = self.extract_pin(text)
        if pin:
            entities["pin"] = pin

        return {
            "intent": intent,
            "confidence": confidence,
            "entities": entities,
            "action_required": action_required,
            "message": message
        }


# Global parser instance
parser = IntentParser()
