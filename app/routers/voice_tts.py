import base64
import hashlib
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.assistant_pipeline import process_message

router = APIRouter()

class TTSRequest(BaseModel):
    text: str

@router.post("/voice_tts")
async def text_to_speech(request: TTSRequest):
    # Use pipeline response text
    result = process_message(message=request.text, metadata={"source": "voice_tts"})
    if result["status"] == "success":
        tts_text = result["response"]
        if not isinstance(tts_text, str):
            tts_text = str(tts_text)
    else:
        raise HTTPException(status_code=500, detail=result["message"])

    # Mock TTS: generate base64 encoded mock audio
    mock_audio = f"Mock audio for: {tts_text}".encode('utf-8')
    audio_base64 = base64.b64encode(mock_audio).decode()
    return {
        "message": "Text converted to speech successfully",
        "data": {"audio_base64": audio_base64},
        "meta": {}
    }
