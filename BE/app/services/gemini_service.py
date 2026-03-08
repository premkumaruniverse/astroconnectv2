import json
import asyncio
from datetime import datetime
from typing import Dict, Any, List
import google.generativeai as genai
from app.core.config import GEMINI_API_KEY

class GeminiService:
    def __init__(self):
        if GEMINI_API_KEY:
            genai.configure(api_key=GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-flash-latest')
        else:
            self.model = None
        self._panchang_cache = {}
        self._horoscope_cache = {}
    
    async def generate_daily_panchang(self, date: str = None) -> Dict[str, Any]:
        """Generate daily panchang using Gemini API with caching"""
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")
        
        # Check cache
        if date in self._panchang_cache:
            return self._panchang_cache[date]

        if not self.model:
            raise Exception("Gemini AI model is not initialized. Please check your API key.")

        prompt = f"""
        Generate detailed daily Panchang (Vedic Calendar) information for date: {date}.
        
        You must return ONLY a valid JSON object. Do not include any markdown formatting like ```json ... ```.
        The JSON structure must be exactly as follows:
        {{
            "date": "{date}",
            "tithi": "Tithi Name (e.g., Shukla Paksha Dashami)",
            "nakshatra": "Nakshatra Name",
            "yog": "Yoga Name",
            "karan": "Karana Name",
            "sunrise": "HH:MM AM",
            "sunset": "HH:MM PM",
            "moonrise": "HH:MM PM",
            "moonset": "HH:MM AM",
            "auspicious_time": "Description of auspicious timings (Abhijit Muhurat, etc.)",
            "inauspicious_time": "Description of inauspicious timings (Rahu Kaal, Yamaganda, etc.)",
            "description": "A brief astrological summary of the day's energy and significance."
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = self._clean_json_content(response.text)
                
            parsed_data = json.loads(content)
            # Save to cache
            self._panchang_cache[date] = parsed_data
            return parsed_data
        except Exception as e:
            print(f"Panchang generation error: {e}")
            raise Exception(f"Failed to generate Panchang from AI: {str(e)}")

    async def generate_daily_horoscope(self, date: str = None) -> List[Dict[str, str]]:
        """Generate daily horoscope for all signs using Gemini API with caching"""
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")
            
        # Check cache
        if date in self._horoscope_cache:
            return self._horoscope_cache[date]

        if not self.model:
            raise Exception("Gemini AI model is not initialized.")

        prompt = f"""
        Generate daily horoscope predictions for all 12 zodiac signs for date: {date}.
        
        You must return ONLY a valid JSON array of objects. Do not include any markdown formatting.
        The JSON structure must be:
        [
            {{ "sign": "Aries", "prediction": "Prediction text..." }},
            ... for all 12 signs
        ]
        
        Keep predictions concise (2-3 sentences), spiritual, and constructive.
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = self._clean_json_content(response.text)
                
            parsed_data = json.loads(content)
            if isinstance(parsed_data, list):
                self._horoscope_cache[date] = parsed_data
                return parsed_data
            raise ValueError("AI returned invalid format for horoscope")
        except Exception as e:
            print(f"Horoscope generation error: {e}")
            raise Exception(f"Failed to generate Horoscope from AI: {str(e)}")

    async def generate_kundli_matching(self, boy_data: Dict[str, Any], girl_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Kundli matching (compatibility) analysis using Gemini"""
        if not self.model:
            raise Exception("Gemini AI model is not initialized.")

        prompt = f"""
        Perform a detailed Vedic Astrology Kundli Matching (Gun Milan) analysis between two individuals:
        Person A (Boy): {json.dumps(boy_data)}
        Person B (Girl): {json.dumps(girl_data)}
        
        Calculate the Ashtakoot Guna Milan score (out of 36) and provide a professional astrological report.
        
        You MUST return ONLY a valid JSON object. Do not include any text before or after the JSON.
        The JSON structure must be:
        {{
            "score": 26,
            "total": 36,
            "status": "Excellent/Good/Average/Poor",
            "guna_milan_details": "A detailed breakdown of how you calculated the score",
            "ashtakoot_score": {{"varna": 1, "vashya": 2, "tara": 3, "yoni": 4, "grahamaitri": 5, "gana": 6, "bhakoot": 7, "nadi": 8}},
            "manglik_analysis": "Summary of manglik dosha for both individuals",
            "conclusion": "Final recommendation for the match based on Vedic principles",
            "relationship_advice": "Practical spiritual advice for their future journey"
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = self._clean_json_content(response.text)
            
            data = json.loads(content)
            if "score" not in data:
                data["score"] = 0
            if "total" not in data:
                data["total"] = 36
            return data
        except Exception as e:
            print(f"Matching error: {e}")
            raise Exception(f"Failed to generate Matching analysis from AI: {str(e)}")

    async def generate_category_insights(self, category: str, user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate specific category insights (Career, Love, etc.) using Gemini"""
        if not self.model:
            raise Exception("Gemini AI model is not initialized.")

        prompt = f"""
        Generate deep spiritual and astrological insights for the category: {category.upper()}.
        Current Date: {datetime.now().strftime("%Y-%m-%d")}
        User Context: {json.dumps(user_context) if user_context else "General"}
        
        You must return ONLY a valid JSON object with:
        {{
            "category": "{category}",
            "title": "A thematic title",
            "overview": "A general summary of current energies",
            "detailed_analysis": "2-3 paragraphs of deep insight",
            "key_takeaways": ["point 1", "point 2", "point 3"],
            "spiritual_remedy": "A simple ritual or practice",
            "lucky_factors": {{"color": "...", "number": "...", "direction": "..."}}
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            content = self._clean_json_content(response.text)
            return json.loads(content)
        except Exception as e:
            print(f"Insight error: {e}")
            raise Exception(f"Failed to generate Category Insights from AI: {str(e)}")

    def _clean_json_content(self, content: str) -> str:
        """Helper to clean markdown from JSON response more robustly"""
        content = content.strip()
        
        # Handle code blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            # Find the first and last backtick blocks
            parts = content.split("```")
            if len(parts) >= 3:
                content = parts[1].strip()
        
        # If still not starting with { or [, find them
        if not (content.startswith('{') or content.startswith('[')):
            start_idx = content.find('{')
            if start_idx == -1:
                start_idx = content.find('[')
            
            end_idx = content.rfind('}')
            if end_idx == -1:
                end_idx = content.rfind(']')
                
            if start_idx != -1 and end_idx != -1:
                content = content[start_idx:end_idx+1]
                
        return content

gemini_service = GeminiService()
