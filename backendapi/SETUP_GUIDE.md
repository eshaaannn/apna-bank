# Step-by-Step Setup Guide

## 1. Environment Setup

### Create Virtual Environment
```bash
cd e:/HACKATHON/project-CCF/apna-bank/backendapi

# Create virtual environment
python -m venv venv

# Activate it
# Windows PowerShell:
venv\Scripts\Activate.ps1
# Windows CMD:
venv\Scripts\activate.bat
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

## 2. Supabase Configuration

### A. Create Supabase Project
1. Go to https://supabase.com
2. Sign up / Log in
3. Create new project
4. Wait for project to be ready (~2 minutes)

### B. Get API Credentials
1. Go to Project Settings → API
2. Copy these values:
   - **Project URL** (starts with https://xxx.supabase.co)
   - **anon public** key
   - **service_role** key (⚠️ Keep this secret!)

### C. Configure Backend
```bash
# Copy example env file
cp .env.example .env

# Edit .env file and paste your Supabase credentials
```

Your `.env` should look like:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. Database Setup

### Run Schema in Supabase
1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy entire contents of `database_schema.sql`
4. Paste and click "Run"
5. Verify tables created in Table Editor

You should see:
- ✅ `users` table
- ✅ `transactions` table
- ✅ 3 sample users

## 4. Create Supabase Auth Users

Since we're using Supabase Auth, we need to create auth users that match our database users.

### Option A: Via Supabase Dashboard
1. Go to Authentication → Users
2. Click "Add user"
3. For each sample user:
   - Email: `ramesh@example.com`
   - Password: `password123`
   - User ID: `00000000-0000-0000-0000-000000000001` (copy from users table)
   - Click "Create user"

Repeat for other sample users:
- `priya@example.com` → ID: `00000000-0000-0000-0000-000000000002`
- `amit@example.com` → ID: `00000000-0000-0000-0000-000000000003`

### Option B: Via SQL (Quick method)
Run this in Supabase SQL Editor:
```sql
-- Link existing users to auth
-- Note: This requires manual password setup in Auth UI
-- OR you can create users via the Auth API from frontend
```

## 5. Start the Backend Server

```bash
# Make sure you're in the backend directory
cd e:/HACKATHON/project-CCF/apna-bank/backendapi

# Make sure virtual environment is activated
# You should see (venv) in your terminal prompt

# Start server
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

## 6. Test the API

### Test Health Endpoint (No Auth)
Open browser: http://localhost:8000

You should see:
```json
{
  "status": "healthy",
  "service": "Voice Banking API",
  "version": "1.0.0"
}
```

### Test API Docs
Open browser: http://localhost:8000/docs

You should see Swagger UI with all endpoints.

### Get JWT Token for Testing

You need to login via Supabase to get a JWT token.

**Quick method using curl:**
```bash
curl -X POST "https://YOUR-PROJECT.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: YOUR-ANON-KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ramesh@example.com",
    "password": "password123"
  }'
```

Copy the `access_token` from response.

### Test Protected Endpoint

```bash
# Test balance endpoint
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/account/balance
```

Expected response:
```json
{
  "balance": 5000.00,
  "currency": "INR",
  "user_id": "00000000-0000-0000-0000-000000000001"
}
```

## 7. Test Voice Intent

```bash
curl -X POST http://localhost:8000/voice/intent \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"text": "Send 200 rupees to Priya"}'
```

Expected response:
```json
{
  "intent": "transfer",
  "confidence": 0.95,
  "entities": {
    "amount": 200,
    "receiver_name": "Priya"
  },
  "action_required": {
    "endpoint": "/transaction/transfer",
    "params": {
      "amount": 200,
      "receiver_phone": null
    },
    "missing_fields": ["receiver_phone"]
  }
}
```

## 8. Test Money Transfer

```bash
curl -X POST http://localhost:8000/transaction/transfer \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "receiver_phone": "9876543211",
       "amount": 100.00,
       "note": "Test transfer"
     }'
```

Expected response:
```json
{
  "transaction_id": "some-uuid",
  "status": "success",
  "new_balance": 4900.00,
  "message": "Successfully transferred ₹100.0 to Priya Sharma"
}
```

## 9. Verify in Supabase

1. Go to Supabase → Table Editor → users
2. Check balances updated:
   - Ramesh: 4900.00 (sent 100)
   - Priya: 3100.00 (received 100)
3. Go to transactions table
4. See new transaction record

## ✅ Success Checklist

- [ ] Virtual environment created and activated
- [ ] Dependencies installed
- [ ] `.env` file configured with Supabase credentials
- [ ] Database schema executed successfully
- [ ] Server starts without errors
- [ ] Health endpoint returns 200
- [ ] JWT token obtained
- [ ] Balance endpoint returns data
- [ ] Voice intent parsing works
- [ ] Money transfer executes successfully
- [ ] Database shows updated balances

## 🐛 Common Issues

### Issue: ModuleNotFoundError
**Solution:** Make sure virtual environment is activated and dependencies installed

### Issue: "SUPABASE_URL not found"
**Solution:** Check `.env` file exists and has correct format

### Issue: 401 Unauthorized
**Solution:** 
1. Verify JWT token is not expired
2. Check token is from correct Supabase project
3. Ensure user exists in both Auth and users table

### Issue: "User not found"
**Solution:** 
1. Check user exists in `users` table
2. Verify user ID matches between Auth and users table
3. Use service_role_key in backend for DB operations

### Issue: Can't get JWT token
**Solution:**
1. Create Auth users in Supabase Dashboard
2. Use correct email/password
3. Use your project's API URL

## 🎯 Next Steps

1. **Frontend Integration:** Connect React/Next.js frontend
2. **Voice Recording:** Implement speech-to-text on frontend
3. **UI:** Build voice command interface
4. **Demo:** Prepare demo flow for judges

## 📞 Need Help?

- Check `/docs` endpoint for API documentation
- Review error messages in terminal logs
- Verify database state in Supabase dashboard
