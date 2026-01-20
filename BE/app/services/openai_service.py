import openai
from datetime import datetime
import json
from typing import Dict, Any
from app.core.config import OPENAI_API_KEY, OPENAI_TENANT_ID, OPENAI_CLIENT_ID

class OpenAIService:
    def __init__(self):
        openai.api_key = OPENAI_API_KEY
        self.tenant_id = OPENAI_TENANT_ID
        self.client_id = OPENAI_CLIENT_ID
    
    async def generate_daily_panchang(self, date: str = None) -> Dict[str, Any]:
        """Generate daily panchang using OpenAI with tenant authentication"""
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")
        
        try:
            # For now, return enhanced fallback data until OpenAI is properly configured
            return self._create_enhanced_panchang(date)
                
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return self._create_enhanced_panchang(date)
    
    def _create_enhanced_panchang(self, date: str) -> Dict[str, Any]:
        """Enhanced panchang data with more details"""
        return {
            "date": date,
            "tithi": "Shukla Paksha Dashami",
            "nakshatra": "Rohini",
            "yog": "Indra",
            "karan": "Taitila",
            "sunrise": "06:30",
            "sunset": "18:45",
            "moonrise": "20:15",
            "moonset": "08:30",
            "auspicious_time": "Morning 10:00-12:00 is favorable for new ventures and important decisions",
            "inauspicious_time": "Rahu Kaal: 16:30-18:00 - Avoid starting new work during this period",
            "description": "A spiritually significant day with positive cosmic energy. Ideal for meditation, prayers, and seeking divine blessings."
        }

openai_service = OpenAIService()