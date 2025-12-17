from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from app.assistant_pipeline import process_message

router = APIRouter()

class EmbedRequest(BaseModel):
    text: str
    session_id: str


class SimilarityRequest(BaseModel):
    texts1: List[str]
    texts2: List[str]
    session_id: str


@router.post("/embed")
async def generate_embeddings(request: EmbedRequest):
    result = process_message(message=request.text, session_id=request.session_id, metadata={"source": "embed"})
    if result["status"] == "success":
        return {"embeddings": [result["response"]["embedding"]], "obfuscated_embeddings": [result["response"]["obfuscated_embedding"]]}
    else:
        raise HTTPException(status_code=500, detail=result["message"])


@router.post("/embed/similarity")
async def compute_similarity(request: SimilarityRequest):
    if not request.texts1 or not request.texts2:
        return {"similarities": []}

    emb1 = []
    for text in request.texts1:
        result = process_message(message=text, session_id=request.session_id, metadata={"source": "embed"})
        if result["status"] == "success":
            emb1.append(result["response"]["obfuscated_embedding"])
        else:
            raise HTTPException(status_code=500, detail=result["message"])

    emb2 = []
    for text in request.texts2:
        result = process_message(message=text, session_id=request.session_id, metadata={"source": "embed"})
        if result["status"] == "success":
            emb2.append(result["response"]["obfuscated_embedding"])
        else:
            raise HTTPException(status_code=500, detail=result["message"])

    # Compute pairwise cosine similarities
    try:
        from sklearn.metrics.pairwise import cosine_similarity
        similarities = cosine_similarity(emb1, emb2).tolist()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Similarity computation failed: {e}")

    return {"similarities": similarities}
