from fastapi import APIRouter, UploadFile, File, HTTPException

from app.assistant_pipeline import process_message

router = APIRouter()

# Supported formats
SUPPORTED_MIMETYPES = {
    "audio/wav": "wav",
    "audio/mpeg": "mp3",
    "audio/mp4": "m4a",
    "audio/x-m4a": "m4a"
}

# MAX size 25MB
MAX_FILE_SIZE = 25 * 1024 * 1024

@router.post("/voice_stt")
async def voice_stt(file: UploadFile = File(...)):
    # Check if file exists
    if not file:
        raise HTTPException(status_code=400, detail="No audio file provided")

    # Read bytes
    content = await file.read()
    size = len(content)

    # Check size
    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max allowed = {MAX_FILE_SIZE / (1024 * 1024)} MB"
        )

    # Check mimetype
    if file.content_type not in SUPPORTED_MIMETYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format. Supported: {', '.join(SUPPORTED_MIMETYPES)}"
        )

    # Mock STT: convert audio to text
    transcribed_text = f"[Mock STT] Transcribed text from {file.filename}"

    # Pass text to pipeline
    result = process_message(message=transcribed_text, metadata={"source": "voice_stt"})
    return result
