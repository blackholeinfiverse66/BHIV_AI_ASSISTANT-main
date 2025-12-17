from fastapi import APIRouter
from pydantic import BaseModel

from app.assistant_pipeline import process_message

router = APIRouter()

class DecisionRequest(BaseModel):
    input: str

@router.post("/decision")
async def make_decision(request: DecisionRequest):
    result = process_message(message=request.input, metadata={"source": "decision_hub"})
    return result
