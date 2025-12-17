from fastapi import APIRouter
from pydantic import BaseModel

from app.assistant_pipeline import process_message

router = APIRouter()

class LLMRequest(BaseModel):
    prompt: str

@router.post("/external_llm")
async def call_external_llm(request: LLMRequest):
    result = process_message(message=request.prompt, metadata={"source": "external_llm"})
    return result
