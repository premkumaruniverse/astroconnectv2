from typing import Dict, Any
import json
import google.generativeai as genai
from app.core.config import GEMINI_API_KEY

class KundliService:
    def __init__(self):
        if GEMINI_API_KEY:
            genai.configure(api_key=GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-flash-latest')
        else:
            self.model = None
    
    async def generate_brihat_kundli(self, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive Kundli using Gemini"""
        
        if not self.model:
            raise Exception("Gemini AI model is not initialized. Please check your API key.")

        prompt = f"""
        Generate a detailed and professional Vedic Astrology Brihat Kundli analysis for:
        Name: {birth_data.get('name', 'Person')}
        Date of Birth: {birth_data.get('date')}
        Time of Birth: {birth_data.get('time')}
        Place of Birth: {birth_data.get('place')}
        
        You MUST return ONLY a valid JSON object. Do not include any text before or after the JSON.
        The JSON structure must be exactly as follows:
        {{
            "basic_info": {{
                "name": "{birth_data.get('name')}",
                "rashi": "moon sign",
                "nakshatra": "birth star",
                "lagna": "ascendant sign",
                "tithi": "lunar day"
            }},
            "planetary_positions": [
                {{"planet": "Sun", "sign": "...", "house": 1, "degree": "...", "strength": "..."}},
                ... and so on for all major planets
            ],
            "predictions": {{
                "personality": "detailed personality traits",
                "career": "career prospects",
                "health": "health tendencies",
                "relationships": "marriage insights",
                "finances": "financial prospects"
            }},
            "remedies": ["remedy 1", "remedy 2"],
            "lucky_elements": {{
                "numbers": [1, 2, 3],
                "colors": ["...", "..."],
                "days": ["...", "..."],
                "direction": "...",
                "gemstone": "..."
            }},
            "dasha_periods": {{
                "current_dasha": "...",
                "period": "...",
                "effects": "..."
            }}
        }}
        """
        
        try:
            print(f"[LOG] Generating Kundli for {birth_data.get('name')}...")
            response = self.model.generate_content(prompt)
            content = self._clean_json_content(response.text)
            
            try:
                data = json.loads(content)
                print(f"[LOG] Successfully generated Kundli for {birth_data.get('name')}")
                return data
            except json.JSONDecodeError as je:
                print(f"[LOG] JSON Parse Error for Kundli: {je}")
                print(f"[LOG] Raw content was: {content[:500]}...")
                raise Exception("AI returned invalid data format. Please try again.")
                
        except Exception as e:
            print(f"Kundli generation error: {str(e)}")
            raise Exception(f"AI Service Error: {str(e)}")

    def _clean_json_content(self, content: str) -> str:
        """Robust JSON cleaning from AI response"""
        content = content.strip()
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            parts = content.split("```")
            if len(parts) >= 3:
                content = parts[1].strip()
        
        if not (content.startswith('{') or content.startswith('[')):
            start_idx = content.find('{')
            if start_idx == -1: start_idx = content.find('[')
            end_idx = content.rfind('}')
            if end_idx == -1: end_idx = content.rfind(']')
            if start_idx != -1 and end_idx != -1:
                content = content[start_idx:end_idx+1]
        return content

kundli_service = KundliService()
