from typing import Dict, Any, Optional
import json
import os
import httpx
from io import BytesIO

# -------------------------------------------------
# Base API URL (local + production safe)
# -------------------------------------------------
BASE_API_URL = os.getenv(
    "INTERNAL_API_URL",
    "http://127.0.0.1:8000"
)

API_KEY = os.getenv("API_KEY", "localtest")

# -------------------------------------------------
# Decision Hub
# -------------------------------------------------
class DecisionHub:
    def __init__(self):
        self.memory_file = "data/memory.json"
        os.makedirs(os.path.dirname(self.memory_file), exist_ok=True)
        if not os.path.exists(self.memory_file):
            with open(self.memory_file, "w") as f:
                json.dump({}, f)

    # ---------------- MEMORY ----------------
    def load_memory(self) -> Dict[str, Any]:
        with open(self.memory_file, "r") as f:
            return json.load(f)

    def save_memory(self, memory: Dict[str, Any]):
        with open(self.memory_file, "w") as f:
            json.dump(memory, f)

    # ---------------- VOICE ----------------
    async def process_voice_input(self, audio_data: bytes, content_type="audio/wav"):
        async with httpx.AsyncClient(timeout=10) as client:
            files = {"file": ("audio.wav", BytesIO(audio_data), content_type)}
            headers = {"X-API-Key": API_KEY}
            res = await client.post(
                f"{BASE_API_URL}/api/voice_stt",
                files=files,
                headers=headers,
            )
            res.raise_for_status()
            return res.json()

    async def generate_voice_output(self, text: str, voice="alloy"):
        async with httpx.AsyncClient(timeout=10) as client:
            headers = {"X-API-Key": API_KEY}
            payload = {"text": text, "voice": voice}
            res = await client.post(
                f"{BASE_API_URL}/api/voice_tts",
                json=payload,
                headers=headers,
            )
            res.raise_for_status()
            return res.json()

    # ---------------- TASK ----------------
    async def create_task(self, description: str):
        async with httpx.AsyncClient(timeout=10) as client:
            headers = {"X-API-Key": API_KEY}
            res = await client.post(
                f"{BASE_API_URL}/api/tasks",
                json={"description": description},
                headers=headers,
            )
            res.raise_for_status()
            return res.json()

    # ---------------- INTENT ----------------
    async def detect_intent(self, text: str):
        async with httpx.AsyncClient(timeout=10) as client:
            headers = {"X-API-Key": API_KEY}
            res = await client.post(
                f"{BASE_API_URL}/api/intent",
                json={"text": text},
                headers=headers,
            )
            res.raise_for_status()
            return res.json()

    async def classify_task(self, intent_data: Dict[str, Any]):
        async with httpx.AsyncClient(timeout=10) as client:
            headers = {"X-API-Key": API_KEY}
            res = await client.post(
                f"{BASE_API_URL}/api/task",
                json=intent_data,
                headers=headers,
            )
            res.raise_for_status()
            return res.json()

    # ---------------- RESPONSE ----------------
    async def generate_response(self, text: str):
        async with httpx.AsyncClient(timeout=10) as client:
            headers = {"X-API-Key": API_KEY}
            res = await client.post(
                f"{BASE_API_URL}/api/summarize",
                json={"text": text},
                headers=headers,
            )
            res.raise_for_status()
            return res.json()

    # ---------------- MAIN DECISION ----------------
    async def make_decision(
        self,
        input_text: str,
        platform: str = "web",
        device_context: str = "desktop",
        voice_input: bool = False,
        audio_data: Optional[bytes] = None,
    ) -> Dict[str, Any]:

        processed_text = input_text
        action_type = "text"

        # Voice processing
        if voice_input and audio_data:
            stt = await self.process_voice_input(audio_data)
            processed_text = stt.get("text", input_text)
            action_type = "voice"

        # Intent
        intent_data = await self.detect_intent(processed_text)
        intent = intent_data.get("intent", "general")

        # Task classification
        try:
            task_data = await self.classify_task(intent_data)
        except Exception:
            task_data = None

        decision = {
            "intent": intent,
            "processed_text": processed_text,
            "platform": platform,
            "device_context": device_context,
        }

        # Execute intent
        if intent == "task":
            decision["task"] = await self.create_task(processed_text)
            decision["final_decision"] = "task_created"

        elif intent == "summarize":
            response = await self.generate_response(processed_text)
            decision["response"] = response.get("summary")
            decision["final_decision"] = "summary_generated"

        else:
            response = await self.generate_response(processed_text)
            decision["response"] = response.get("summary")
            decision["final_decision"] = "response_generated"

        # Voice output
        if action_type == "voice" and "response" in decision:
            decision["voice"] = await self.generate_voice_output(decision["response"])

        # Memory
        memory = self.load_memory()
        memory[processed_text[:50]] = decision
        self.save_memory(memory)

        return decision


decision_hub = DecisionHub()
