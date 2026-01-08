import sys
import os
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import APIKeyHeader
from fastapi.openapi.utils import get_openapi
from dotenv import load_dotenv

# ------------------------------
# Path & ENV
# ------------------------------
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(ROOT_DIR)

load_dotenv(os.path.join(ROOT_DIR, ".env"))

# ------------------------------
# Local imports
# ------------------------------
from app.core.logging import setup_logging, get_logger
from app.core.database import create_tables
from app.core.security import rate_limit, audit_log

from app.routers import (
    summarize,
    intent,
    task,
    decision_hub,
    rl_action,
    embed,
    voice_stt,
    voice_tts,
    external_llm,
    bhiv,
)

# ------------------------------
# Logging
# ------------------------------
setup_logging()
logger = get_logger(__name__)

# ------------------------------
# Lifespan
# ------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    logger.info("Dynamic CORS enabled: allow_origin_regex='https://.*\\.vercel\\.app', allow_origins=['http://localhost:5173', 'http://127.0.0.1:5173']")
    yield

# ------------------------------
# FastAPI app
# ------------------------------
app = FastAPI(
    title="Assistant Core v3",
    description="Multi-Platform Brain & Integration Layer",
    version="3.0.0",
    lifespan=lifespan,
)

# =====================================================
# ✅ CORS — MUST BE FIRST MIDDLEWARE
# =====================================================
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------
# API Key header (OpenAPI)
# ------------------------------
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    schema = get_openapi(
        title="Assistant Core v3",
        version="3.0.0",
        description="Multi-Platform Brain & Integration Layer",
        routes=app.routes,
    )

    schema["components"]["securitySchemes"] = {
        "APIKeyHeader": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key",
        }
    }

    for path in schema["paths"]:
        if path.startswith("/api"):
            for method in schema["paths"][path]:
                schema["paths"][path][method]["security"] = [
                    {"APIKeyHeader": []}
                ]

    app.openapi_schema = schema
    return schema

app.openapi = custom_openapi

# =====================================================
# ✅ SECURITY MIDDLEWARE (CORS-SAFE)
# =====================================================
@app.middleware("http")
async def security_middleware(request: Request, call_next):

    # ✅ Allow browser preflight
    if request.method == "OPTIONS":
        response = await call_next(request)
        if request.url.path.startswith("/api"):
            logger.info(f"Request: method={request.method}, path={request.url.path}, origin={request.headers.get('origin', 'none')}")
            logger.info(f"Response: status={response.status_code}")
        return response

    # ✅ Allow non-API routes
    if not request.url.path.startswith("/api"):
        return await call_next(request)

    if request.url.path.startswith("/api"):
        logger.info(f"Request: method={request.method}, path={request.url.path}, origin={request.headers.get('origin', 'none')}")

    # Rate limit
    rate_limit(request)

    api_key = request.headers.get("X-API-Key")
    if api_key != os.getenv("API_KEY"):
        response = JSONResponse(
            status_code=401,
            content={"detail": "Authentication failed"},
        )
        if request.url.path.startswith("/api"):
            logger.info(f"Response: status={response.status_code}")
        return response

    audit_log(request, "api_key_user")
    response = await call_next(request)
    if request.url.path.startswith("/api"):
        logger.info(f"Response: status={response.status_code}")
    return response

# ------------------------------
# Routers (PUBLIC APIs)
# ------------------------------
app.include_router(summarize.router, prefix="/api", tags=["Summarize"])
app.include_router(intent.router, prefix="/api", tags=["Intent"])
app.include_router(task.router, prefix="/api", tags=["Task"])
app.include_router(decision_hub.router, prefix="/api", tags=["Decision Hub"])
app.include_router(rl_action.router, prefix="/api", tags=["RL Action"])
app.include_router(embed.router, prefix="/api", tags=["Embed"])
app.include_router(voice_stt.router, prefix="/api", tags=["Voice STT"])
app.include_router(voice_tts.router, prefix="/api", tags=["Voice TTS"])
app.include_router(external_llm.router, prefix="/api", tags=["External LLM"])
app.include_router(bhiv.router, prefix="/api", tags=["BHIV"])

# ------------------------------
# System endpoints
# ------------------------------
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "3.0.0",
    }

@app.get("/")
async def root():
    return {
        "message": "Assistant Core v3 API",
        "status": "running",
    }

@app.post("/api/rotate_key")
async def rotate_api_key():
    import secrets
    new_key = secrets.token_hex(32)
    # In production, update env or db
    return {"new_api_key": new_key, "message": "Rotate your API key and update environment variables"}
