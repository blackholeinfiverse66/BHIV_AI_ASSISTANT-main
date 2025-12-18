"""
AI Assistant Pipeline Module

This module provides the central orchestration layer for processing user messages
in the BHIV AI Assistant. It handles input validation, intent detection, decision
making, embedding computation, LLM routing, and response formatting.

The pipeline is designed to be async-safe, production-ready, and extensible.
"""

import hashlib
from typing import Dict, Any, Optional


def process_message(
    message: str,
    session_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Process a user message through the AI assistant pipeline.

    Args:
        message: The user's input message as a string.
        session_id: Optional session identifier for conversation continuity.
        metadata: Optional dictionary containing additional context (e.g., user_id, platform).

    Returns:
        A dictionary with the following structure:
        - On success: {"status": "success", "session_id": str, "intent": str, "response": Any, "meta": dict}
        - On error: {"status": "error", "message": str}

    The pipeline stages:
    1. Input validation and normalization
    2. Intent detection
    3. Decision hub logic
    4. LLM routing or embedding computation
    5. Response formatting
    """
    try:
        # Early return for respond source
        if metadata and metadata.get("source") == "respond":
            chat_response = generate_chat_response(message)
            return {
                "status": "success",
                "session_id": session_id,
                "intent": "chat",
                "response": chat_response,
                "meta": metadata
            }

        # Stage 1: Input validation & normalization
        normalized_message = _validate_and_normalize_input(message)

        # Stage 2: Intent detection
        intent = _detect_intent(normalized_message, metadata)

        # Stage 3: Decision hub logic
        decision = _decide_action(intent, metadata)

        # Stage 4: Action execution (LLM, embedding, or direct response)
        if decision == "llm":
            response = _call_llm(normalized_message, session_id, metadata)
        elif decision == "embed":
            response = _compute_embedding(normalized_message)
        else:  # direct or fallback
            response = _get_direct_response(intent)

        # Stage 5: Response formatting
        return {
            "status": "success",
            "session_id": session_id,
            "intent": intent,
            "response": response,
            "meta": metadata or {}
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Pipeline processing failed: {str(e)}"
        }


def generate_chat_response(message: str) -> str:
    """
    Generate a simple chat response for the respond endpoint.

    Args:
        message: The user's message.

    Returns:
        A string response.
    """
    # Simple echo response for now, can be replaced with LLM later
    return f"I received your message: '{message}'. How can I help you today?"


def _validate_and_normalize_input(message: str) -> str:
    """
    Validate and normalize the input message.

    Args:
        message: The raw input message.

    Returns:
        Normalized message string.

    Raises:
        ValueError: If the message is invalid.
    """
    if not isinstance(message, str):
        raise ValueError("Message must be a string")
    normalized = message.strip()
    if not normalized:
        raise ValueError("Message cannot be empty after trimming")
    return normalized


def _detect_intent(message: str, metadata: Optional[Dict[str, Any]]) -> str:
    """
    Detect the intent of the message using simple heuristics.

    Args:
        message: Normalized message.
        metadata: Optional metadata dictionary.

    Returns:
        Detected intent as a string.
    """
    # Check if intent is explicitly provided in metadata
    if metadata and "intent" in metadata:
        return metadata["intent"]

    # Simple heuristic-based detection
    message_lower = message.lower()
    if "embed" in message_lower or len(message.split()) < 5:  # Short messages might be embedding requests
        return "embedding"
    elif "?" in message or message_lower.startswith(("what", "how", "why", "when", "where", "who")):
        return "question"
    elif message_lower.startswith(("do", "create", "run", "execute")):
        return "command"
    else:
        return "conversation"


def _decide_action(intent: str, metadata: Optional[Dict[str, Any]]) -> str:
    """
    Decide the action based on intent and metadata.

    Args:
        intent: Detected intent.
        metadata: Optional metadata.

    Returns:
        Action to take: "llm", "embed", "direct", or "fallback".
    """
    if intent == "embedding":
        return "embed"
    elif intent == "question":
        return "llm"
    elif intent == "command":
        return "direct"
    else:
        return "fallback"


def _compute_embedding(text: str) -> Dict[str, Any]:
    """
    Compute mock embeddings for the given text using standard library.

    Args:
        text: Text to embed.

    Returns:
        Dictionary with "embedding" and "obfuscated_embedding" lists.
    """
    # Use SHA-256 hash to generate deterministic pseudo-random values
    hash_obj = hashlib.sha256(text.encode('utf-8'))
    hash_bytes = hash_obj.digest()

    # Convert bytes to float list (0-1 range)
    base_embedding = [b / 255.0 for b in hash_bytes]

    # Extend to 384 dimensions by repeating and truncating
    embedding_dim = 384
    embedding = (base_embedding * (embedding_dim // len(base_embedding) + 1))[:embedding_dim]

    # For obfuscated embedding, use MD5 hash with slight modification
    md5_hash = hashlib.md5(text.encode('utf-8')).digest()
    obfuscated_base = [b / 255.0 for b in md5_hash]
    obfuscated_embedding = (obfuscated_base * (embedding_dim // len(obfuscated_base) + 1))[:embedding_dim]

    return {
        "embedding": embedding,
        "obfuscated_embedding": obfuscated_embedding
    }


def _call_llm(message: str, session_id: Optional[str], metadata: Optional[Dict[str, Any]]) -> str:
    """
    Mock LLM call. In a real implementation, this would route to external LLMs.

    Since API keys are not required and we use standard library only,
    this returns a graceful fallback response.
    """
    # Check for mock API keys in environment (but don't require them)
    # For now, always return fallback since no actual LLM integration
    return "I'm sorry, but the LLM service is currently unavailable. This is a fallback response."


def _get_direct_response(intent: str) -> str:
    """
    Generate a direct response based on intent.

    Args:
        intent: The detected intent.

    Returns:
        Direct response string.
    """
    responses = {
        "command": "Command executed successfully.",
        "conversation": "Thank you for your message. How can I assist you further?",
        "fallback": "I'm not sure how to respond to that. Please try rephrasing your request."
    }
    return responses.get(intent, responses["fallback"])