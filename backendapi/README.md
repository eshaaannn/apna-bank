# Voice-First Rural Banking Assistant - Backend API

## 🎯 Overview

A secure, voice-driven banking backend built with **FastAPI** and **Supabase** for hackathon MVP demonstration. This backend handles authentication, business logic, voice intent processing, and secure transactions for a rural banking assistant.

**Key Features:**
- 🔐 JWT-based authentication via Supabase
- 💰 Balance checking, money transfers, bill payments
- 🎤 Voice command intent parsing with Hinglish support
- 🛡️ Transaction safety with atomic operations
- 🚦 Rate limiting for security
- 📝 Comprehensive API documentation

---

## 📁 Project Structure

```
backendapi/
├── main.py                 # FastAPI application entry point
├── config.py              # Environment configuration
├── database.py            # Supabase client & DB operations
├── auth.py                # JWT validation middleware
├── models.py              # Pydantic request/response models
├── intent_parser.py       # Voice intent processing
├── routers/
│   ├── __init__.py
│   ├── account.py         # Balance & account endpoints
│   ├── transaction.py     # Transfer & bill payment endpoints
│   └── voice.py           # Voice intent endpoint
├── requirements.txt       # Python dependencies
├── .env.example           # Environment variables template
└── README.md              # This file
```

---

## 🚀 Quick Start

### 1. Prerequisites

- Python 3.9+
- Supabase account (free tier works)
- Virtual environment (recommended)

### 2. Installation

```bash
# Navigate to backend directory
cd apna-bank/backendapi

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Setup

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your Supabase credentials
# Get these from: https://app.supabase.com/project/_/settings/api
```

**Required environment variables:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

### 4. Database Setup

Run the SQL schema in your Supabase SQL editor:

```sql
-- See database_schema.sql file
```

### 5. Run the Server

```bash
# Development mode (auto-reload)
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server runs at: **http://localhost:8000**

**API Documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 📡 API Endpoints

### Authentication
All endpoints (except `/` and `/health`) require a valid Supabase JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Account Endpoints

#### `GET /account/balance`
Get current account balance.

**Response:**
```json
{
  "balance": 5000.00,
  "currency": "INR",
  "user_id": "uuid"
}
```

---

### Transaction Endpoints

#### `POST /transaction/transfer`
Transfer money to another user.

**Request:**
```json
{
  "receiver_phone": "9876543210",
  "amount": 200.00,
  "note": "Payment for groceries"
}
```

**Response:**
```json
{
  "transaction_id": "uuid",
  "status": "success",
  "new_balance": 4800.00,
  "message": "Successfully transferred ₹200.0 to Ramesh"
}
```

**Errors:**
- `400` - Insufficient funds
- `404` - Receiver not found
- `401` - Unauthorized

---

#### `POST /transaction/billpay`
Pay utility bills.

**Request:**
```json
{
  "bill_type": "electricity",
  "amount": 500.00,
  "account_number": "1234567890"
}
```

**Valid bill types:** `electricity`, `water`, `mobile`, `internet`, `gas`

**Response:**
```json
{
  "transaction_id": "uuid",
  "status": "success",
  "bill_type": "electricity",
  "new_balance": 4500.00
}
```

---

#### `GET /transaction/history?limit=50&transaction_type=transfer`
Get transaction history.

**Query Parameters:**
- `limit` (optional): Max transactions to return (default: 50, max: 100)
- `transaction_type` (optional): Filter by type (`transfer`, `billpay`)

**Response:**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "type": "transfer",
      "amount": 200.00,
      "status": "completed",
      "created_at": "2026-01-27T18:30:00Z",
      "sender_id": "uuid",
      "receiver_id": "uuid",
      "note": "Payment for groceries"
    }
  ],
  "total": 1
}
```

---

### Voice Endpoints

#### `POST /voice/intent`
Parse voice command into structured intent.

**Request:**
```json
{
  "text": "Send 200 rupees to Ramesh"
}
```

**Response:**
```json
{
  "intent": "transfer",
  "confidence": 0.95,
  "entities": {
    "amount": 200,
    "receiver_name": "Ramesh"
  },
  "action_required": {
    "endpoint": "/transaction/transfer",
    "params": {
      "amount": 200,
      "receiver_phone": null
    },
    "missing_fields": ["receiver_phone"]
  },
  "message": "Please provide: receiver_phone"
}
```

**Supported intents:**
- `transfer` - Money transfer
- `balance` - Balance check
- `billpay` - Bill payment
- `unknown` - Unrecognized command

**Example voice commands:**
- "Check my balance"
- "Send 500 rupees to Ramesh"
- "Pay electricity bill 1000"
- "Mere account mein kitna paisa hai" (Hinglish)

---

## 🧪 Testing

### Using curl

```bash
# Health check
curl http://localhost:8000/

# Get balance (requires JWT)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/account/balance

# Transfer money
curl -X POST http://localhost:8000/transaction/transfer \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "receiver_phone": "9876543210",
       "amount": 100.00,
       "note": "Test transfer"
     }'

# Parse voice intent
curl -X POST http://localhost:8000/voice/intent \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"text": "Send 200 rupees to Ramesh"}'
```

### Using Postman/Thunder Client

1. Import the API into Postman using the OpenAPI spec at `/docs`
2. Set `Authorization` header with your Supabase JWT
3. Test each endpoint

---

## 🔒 Security Features

### 1. JWT Validation
Every protected endpoint validates the Supabase JWT token:
- Extracts user ID from token (not request body)
- Verifies token validity with Supabase
- Returns 401 for invalid/expired tokens

### 2. Transaction Safety
- **Atomic operations**: All balance updates use database transactions
- **Negative balance prevention**: Database constraints + application-level checks
- **Double-spending prevention**: Transaction-level locking

### 3. Rate Limiting
Sensitive endpoints are rate-limited using `slowapi`:
- Prevents brute force attacks
- Limits API abuse

### 4. Input Validation
All inputs validated using Pydantic models:
- Amount must be > 0
- Required fields enforced
- Type safety guaranteed

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone TEXT UNIQUE NOT NULL,
    name TEXT,
    balance DECIMAL(10,2) DEFAULT 0 CHECK (balance >= 0),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id),
    receiver_id UUID REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'completed',
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎤 Voice Intent Processing

### How It Works

1. **Frontend**: Records voice → converts to text (speech-to-text)
2. **Backend receives**: Plain text string
3. **Intent parser**: Analyzes text using rule-based patterns
4. **Extraction**: Pulls out entities (amount, receiver, bill type)
5. **Response**: Returns structured intent + action recommendation

### Hinglish Support

The parser recognizes both English and Hindi words:

| Hinglish | English |
|----------|---------|
| bhejo    | send    |
| kitna    | how much |
| dikhao   | show    |
| paisa    | money   |
| bijli    | electricity |

**Example:**
```
Input: "Ramesh ko 500 rupaye bhejo"
→ Intent: transfer
→ Amount: 500
→ Receiver: Ramesh
```

---

## 🏗️ Architecture

```
┌──────────┐
│ Frontend │ (Untrusted)
└────┬─────┘
     │ 1. POST /voice/intent + JWT + text
     ▼
┌──────────────┐
│ FastAPI API  │ (Authority)
│  - main.py   │
└──────┬───────┘
       │ 2. Validate JWT (auth.py)
       ▼
┌──────────────────┐
│ Supabase Auth    │ ✓ Token valid
└──────────────────┘
       │ 3. Parse intent (intent_parser.py)
       │    → Execute business logic
       ▼
┌──────────────────┐
│ Database Layer   │ (database.py)
│ - Atomic ops     │
│ - Validation     │
└──────┬───────────┘
       │ 4. Update DB
       ▼
┌──────────────────┐
│ Supabase DB      │ (PostgreSQL)
└──────────────────┘
       │ 5. Return result
       ▼
┌──────────────┐
│ Frontend     │
└──────────────┘
```

---

## 🎯 Hackathon Best Practices

### What This MVP Does ✅
- Secure authentication with real Supabase
- Atomic transactions to prevent race conditions
- Voice intent parsing with Hinglish
- Clean API design with proper error handling
- Real database operations

### What's Mocked (Intentionally) 🎭
- **No real bank integrations** - All money is virtual wallets
- **Static billers** - Predefined bill types, no real utility companies
- **No KYC** - Simplified user onboarding for demo
- **Basic voice parsing** - Rule-based, not advanced NLP

### Demo Flow Recommendation
1. **Setup**: Show Supabase dashboard with users table
2. **Auth**: Login user, get JWT token
3. **Balance**: Call `/account/balance` - show response
4. **Voice**: Say "Send 100 to Ramesh" → show intent parsing
5. **Transfer**: Execute transfer → show updated balances in DB
6. **Bill Pay**: Pay electricity bill → show transaction log
7. **History**: Show transaction history

---

## 🐛 Troubleshooting

### Common Issues

**1. `SUPABASE_URL not found`**
- Ensure `.env` file exists
- Check environment variable names match exactly

**2. `401 Unauthorized`**
- Verify JWT token is valid
- Check token hasn't expired
- Ensure `Authorization: Bearer <token>` header format

**3. `Insufficient funds`**
- Manually add balance to user in Supabase dashboard
- See database setup section

**4. `User not found`**
- Users must exist in `users` table before transfers
- Create users via Supabase Auth or manual DB insert

---

## 📚 Tech Stack

- **FastAPI** - Modern Python web framework
- **Supabase** - Backend-as-a-Service (Auth + PostgreSQL)
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server
- **slowapi** - Rate limiting

---

## 👨‍💻 Development Notes

### Adding New Endpoints
1. Create router in `routers/`
2. Define Pydantic models in `models.py`
3. Add business logic to router
4. Include router in `main.py`

### Adding New Intent Types
1. Add keywords to `intent_parser.py`
2. Create extraction logic
3. Update `VoiceIntentResponse` model

### Database Changes
1. Update schema in Supabase SQL editor
2. Modify `database.py` methods
3. Update Pydantic models

---

## 📄 License

This is a hackathon MVP project. Feel free to use and modify.

---

## 🙏 Acknowledgments

Built for **Voice-First Rural Banking Assistant** hackathon project.

**Backend Stack:**
- FastAPI for API framework
- Supabase for auth & database
- Python for business logic

---

## 📞 Support

For issues or questions:
1. Check `/docs` endpoint for API documentation
2. Review error messages in API responses
3. Check server logs for debugging

**Happy Hacking! 🚀**
