import google.generativeai as genai
from typing import List, Dict, Any
from app.core.config import GEMINI_API_KEY

class AIGuruService:
    def __init__(self):
        if GEMINI_API_KEY:
            genai.configure(api_key=GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-flash-latest')
        else:
            self.model = None

    async def get_response(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Get response from AI Guru (Gemini)
        """
        if not self.model:
            return {"choices": [{"message": {"content": "The stars are currently obscured. Please check back later."}}]}

        # Convert conversation history from OpenAI format to Gemini format
        # Gemini history: List of {'role': 'user'|'model', 'parts': [content]}
        history = []
        for msg in messages[:-1]: # All but the last one
            role = 'user' if msg['role'] == 'user' else 'model'
            history.append({'role': role, 'parts': [msg['content']]})
        
        last_message = messages[-1]['content']

        # System prompt setting the persona
        system_instruction = "You are a wise and knowledgeable AI Guru for an Astrology app called AstroVeda. You provide guidance, astrological insights, and spiritual advice. Be kind, mystical, and helpful. Keep your answers concise unless asked for details."

        try:
            # We can use system_instruction when creating the model or prefix the first message
            # For simplicity, let's prefix the persona logic
            chat = self.model.start_chat(history=history)
            response = chat.send_message(f"{system_instruction}\n\nUser: {last_message}")
            
            # Mimic the structure expected by the router (response["choices"][0]["message"]["content"])
            return {
                "choices": [
                    {
                        "message": {
                            "content": response.text
                        }
                    }
                ]
            }
        except Exception as e:
            print(f"Gemini API error: {e}")
            return {
                "choices": [
                    {
                        "message": {
                            "content": "My cosmic vision is temporarily clouded. Please try again soon."
                        }
                    }
                ]
            }

ai_guru_service = AIGuruService()
