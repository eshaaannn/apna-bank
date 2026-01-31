"""
Voice-First Rural Banking Assistant - FastAPI Backend
Main application entry point.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from config import settings

# Import routers
from routers import account, transaction, voice, auth_local


# ============== App Initialization ==============

app = FastAPI(
    title="Voice Banking API",
    description="Secure voice-first banking backend for rural users - FastAPI + Supabase",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ============== Rate Limiting ==============

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ============== CORS Middleware ==============

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"\n>>>> [{request.method}] {request.url.path}")
    response = await call_next(request)
    print(f"<<<< Status: {response.status_code}")
    return response

# ============== Include Routers ==============

app.include_router(account.router)
app.include_router(transaction.router)
app.include_router(voice.router)
app.include_router(auth_local.router)

# ============== Health Check ==============

@app.get(
    "/",
    tags=["Health"],
    summary="Health Check",
    description="Basic health check endpoint to verify API is running."
)
async def health_check():
    """
    Health check endpoint.
    Returns API status and version.
    """
    return {
        "status": "healthy",
        "service": "Voice Banking API",
        "version": "1.0.0",
        "message": "Voice-First Rural Banking Assistant Backend is running!"
    }


@app.get(
    "/health",
    tags=["Health"],
    summary="Detailed Health Check"
)
async def detailed_health():
    """
    Detailed health check with component status.
    """
    return {
        "status": "healthy",
        "components": {
            "api": "operational",
            "auth": "operational",
            "database": "operational"
        }
    }


# ============== Global Exception Handler ==============

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler for unhandled errors.
    Prevents leaking sensitive information.
    """
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred. Please try again later."
        }
    )


# ============== Run Server ==============

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload
    )
