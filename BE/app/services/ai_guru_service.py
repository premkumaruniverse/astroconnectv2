import httpx
from typing import List, Dict, Any
from app.core.config import OPENROUTER_API_KEY, OPENROUTER_URL, SITE_URL, SITE_NAME

class AIGuruService:
    def __init__(self):
        self.api_key = OPENROUTER_API_KEY
        self.api_url = OPENROUTER_URL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": SITE_URL,
            "X-Title": SITE_NAME,
            "Content-Type": "application/json"
        }

    async def get_response(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Get response from AI Guru (OpenRouter)
        """
        # Ensure there is a system message setting the persona
        system_message = {
            "role": "system",
            "content": "You are a wise and knowledgeable AI Guru for an Astrology app called AstroVeda. You provide guidance, astrological insights, and spiritual advice. Be kind, mystical, and helpful. Keep your answers concise unless asked for details."
        }
        
        # Prepend system message
        final_messages = [system_message] + messages

        # Default model, can be made configurable
        model = "google/gemini-2.0-flash-exp:free" 

        payload = {
            "model": model,
            "messages": final_messages
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.api_url,
                    headers=self.headers,
                    json=payload,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                print(f"OpenRouter API error: {e}")
                # Fallback or re-raise
                raise Exception(f"Failed to get response from AI Guru: {str(e)}")

ai_guru_service = AIGuruService()
