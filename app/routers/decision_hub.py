from fastapi import APIRouter, Form, UploadFile, File
from typing import Optional

from app.assistant_pipeline import process_message

router = APIRouter()

@router.post("/decision_hub")
async def make_decision(
    input_text: str = Form(...),
    platform: str = Form("web"),
    device_context: str = Form("desktop"),
    voice_input: bool = Form(False),
    audio_file: Optional[UploadFile] = File(None),
):
    result = process_message(
        message=input_text,
        metadata={
            "source": "decision_hub",
            "platform": platform,
            "device_context": device_context,
            "voice_input": voice_input,
        }
    )
    return {
        "message": "I've analyzed your input and determined the best course of action.",
        "data": result,
        "meta": {}
    }
