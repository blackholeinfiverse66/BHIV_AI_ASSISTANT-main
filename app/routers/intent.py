from fastapi import APIRouter
from pydantic import BaseModel

from app.assistant_pipeline import process_message

router = APIRouter()

class IntentRequest(BaseModel):
    text: str

@router.post("/intent")
async def detect_intent(request: IntentRequest):
    result = process_message(message=request.text, metadata={"source": "intent"})
    return {
        "message": f"I detected that your intent is '{result['intent']}'.",
        "data": result,
        "meta": {"intent": result["intent"]}
    }
