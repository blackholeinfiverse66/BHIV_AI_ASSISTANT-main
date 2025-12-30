import sys
import os

# Add project root to Python path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(ROOT_DIR)

from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi.security import APIKeyHeader
from fastapi.openapi.utils import get_openapi

# ------------------------------
# Load environment variables
# ------------------------------
load_dotenv(dotenv_path=os.path.join(ROOT_DIR, ".env"))

# ------------------------------
# Local imports
# ------------------------------
from .core.logging import setup_logging, get_logger
from .core.database import create_tables
from .core.security import rate_limit, audit_log

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
# Setup logging
# ------------------------------
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


# ------------------------------
# FastAPI App
# ------------------------------
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

app = FastAPI(
    title="Assistant Core v3",
    description="Multi-Platform Brain & Integration Layer",
    version="3.0.0",
    lifespan=lifespan,
    swagger_ui_parameters={"persistAuthorization": True},
)

# ------------------------------
# OpenAPI (API Key Security)
# ------------------------------
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Assistant Core v3",
        version="3.0.0",
        description="Multi-Platform Brain & Integration Layer",
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "APIKeyHeader": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key",
        }
    }

    for path in openapi_schema["paths"]:
        if path.startswith("/api"):
            for method in openapi_schema["paths"][path]:
                openapi_schema["paths"][path][method]["security"] = [
                    {"APIKeyHeader": []}
                ]

    app.openapi_schema = openapi_schema
    return openapi_schema


app.openapi = custom_openapi

# ------------------------------
# CORS (Vercel-safe)
# ------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  # Required for X-API-Key
)

# ------------------------------
# Security Middleware
# ------------------------------
@app.middleware("http")
async def security_middleware(request: Request, call_next):

    # Allow non-API routes
    if not request.url.path.startswith("/api"):
        return await call_next(request)

    # Allow CORS preflight
    if request.method == "OPTIONS":
        return await call_next(request)

    rate_limit(request)

    api_key = request.headers.get("X-API-Key")

    if api_key != os.getenv("API_KEY"):
        return JSONResponse(
            status_code=401,
            content={"detail": "Authentication failed"},
        )

    audit_log(request, "api_key_user")
    return await call_next(request)

# ------------------------------
# ROUTERS (PUBLIC APIs)
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
# SYSTEM ENDPOINTS
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
