from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import logger
from app.db.seed import seed_database
from app.db.session import SessionLocal, engine
from app.models.base import Base
from app.tts import router as tts_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed default demonstration records
    logger.info("Initializing CarePilot AI database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        logger.info("Database schema initialized and seed verification complete.")
    finally:
        db.close()
    yield
    # Shutdown
    logger.info("CarePilot AI backend shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="CarePilot AI — AI-Powered Personal Health Copilot Backend API (Altrix Labs)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware with restricted explicit origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"Unhandled server error on {request.method} {request.url.path}: {str(exc)}",
        exc_info=True,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."},
    )


# Root
@app.get("/", tags=["Root"])
def root():
    return {
        "message": "CarePilot-AI API is running",
        "status": "success",
    }


# Health Check
@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "apiPrefix": settings.API_V1_STR,
    }


# Include Versioned API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Include TTS Router
app.include_router(tts_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
