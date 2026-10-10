from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.tts import router as tts_router

app = FastAPI(
    title="CarePilot-AI API",
    description="AI-powered healthcare assistant services",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tts_router)


@app.get("/")
def home():
    return {
        "message": "CarePilot-AI API is running",
        "status": "success",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}