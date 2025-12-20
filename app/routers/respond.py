from fastapi import APIRouter
from pydantic import BaseModel

from app.assistant_pipeline import process_message

router = APIRouter()

class RespondRequest(BaseModel):
    message: str
    session_id: str

@router.post("/api/respond")
async def generate_response(request: RespondRequest):
    result = process_message(message=request.message, session_id=request.session_id, metadata={"source": "respond"})
    return result
