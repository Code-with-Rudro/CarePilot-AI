import os

import requests
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

load_dotenv()

router = APIRouter(prefix="/api/tts", tags=["Text-to-Speech"])

MURF_API_KEY = os.getenv("MURF_API_KEY")
MURF_API_URL = "https://api.murf.ai/v1/speech/generate"


class TTSRequest(BaseModel):
    text: str = Field(min_length=1, max_length=3000)
    voice_id: str = "en-US-miles"


@router.get("/health")
def tts_health():
    return {"status": "TTS service ready"}


@router.post("/generate")
def generate_speech(request: TTSRequest):
    if not MURF_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="MURF_API_KEY is not configured"
        )

    payload = {
        "text": request.text,
        "voiceId": request.voice_id,
        "format": "MP3"
    }

    headers = {
        "api-key": MURF_API_KEY,
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(
            MURF_API_URL,
            headers=headers,
            json=payload,
            timeout=60
        )

        if response.status_code >= 400:
            raise HTTPException(
                status_code=502,
                detail="Murf API request failed. Check API settings."
            )

        data = response.json()
        audio_url = data.get("audioFile")

        if not audio_url:
            raise HTTPException(
                status_code=502,
                detail="Murf did not return an audio URL"
            )

        return {
            "success": True,
            "audio_url": audio_url
        }

    except requests.RequestException:
        raise HTTPException(
            status_code=502,
            detail="Could not connect to Murf AI"
        )