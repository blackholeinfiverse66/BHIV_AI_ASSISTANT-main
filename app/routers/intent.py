from fastapi import APIRouter
from pydantic import BaseModel

from app.assistant_pipeline import process_message

router = APIRouter()

class IntentRequest(BaseModel):
    text: str

@router.post("/intent")
async def detect_intent(request: IntentRequest):
    result = process_message(message=request.text, metadata={"source": "intent"})
    return {"status": result["status"], "intent": result["intent"]}
