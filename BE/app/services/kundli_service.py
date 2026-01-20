from app.services.openai_service import openai_service
from typing import Dict, Any
import json

class KundliService:
    
    async def generate_brihat_kundli(self, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive Kundli using LLM"""
        
        prompt = f"""
        Generate a detailed Brihat Kundli analysis for:
        Name: {birth_data.get('name', 'Person')}
        Date: {birth_data.get('date')}
        Time: {birth_data.get('time')}
        Place: {birth_data.get('place')}
        
        Provide JSON response with:
        {{
            "basic_info": {{
                "rashi": "moon sign",
                "nakshatra": "birth star",
                "lagna": "ascendant sign",
                "tithi": "lunar day"
            }},
            "planetary_positions": [
                {{"planet": "Sun", "sign": "Aries", "house": 1, "degree": "15°30'"}},
                {{"planet": "Moon", "sign": "Taurus", "house": 2, "degree": "22°45'"}}
            ],
            "predictions": {{
                "personality": "brief personality traits",
                "career": "career prospects and suitable fields",
                "health": "health tendencies and precautions",
                "relationships": "marriage and relationship insights",
                "finances": "financial prospects and advice"
            }},
            "remedies": [
                "Wear Ruby gemstone for Sun strength",
                "Chant Gayatri Mantra daily"
            ],
            "lucky_elements": {{
                "numbers": [1, 3, 9],
                "colors": ["Red", "Orange"],
                "days": ["Sunday", "Tuesday"],
                "direction": "East"
            }}
        }}
        """
        
        try:
            # For now, return structured data - can be enhanced with actual LLM call
            return self._generate_sample_kundli(birth_data)
        except Exception as e:
            print(f"Kundli generation error: {e}")
            return self._generate_sample_kundli(birth_data)
    
    def _generate_sample_kundli(self, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate sample kundli data"""
        return {
            "basic_info": {
                "name": birth_data.get('name', 'Person'),
                "rashi": "Vrishabha (Taurus)",
                "nakshatra": "Rohini",
                "lagna": "Mesha (Aries)",
                "tithi": "Dashami"
            },
            "planetary_positions": [
                {"planet": "Sun", "sign": "Aries", "house": 1, "degree": "15°30'", "strength": "Strong"},
                {"planet": "Moon", "sign": "Taurus", "house": 2, "degree": "22°45'", "strength": "Moderate"},
                {"planet": "Mars", "sign": "Scorpio", "house": 8, "degree": "8°12'", "strength": "Own Sign"},
                {"planet": "Mercury", "sign": "Pisces", "house": 12, "degree": "28°55'", "strength": "Weak"},
                {"planet": "Jupiter", "sign": "Sagittarius", "house": 9, "degree": "12°20'", "strength": "Own Sign"},
                {"planet": "Venus", "sign": "Gemini", "house": 3, "degree": "5°40'", "strength": "Moderate"},
                {"planet": "Saturn", "sign": "Capricorn", "house": 10, "degree": "18°15'", "strength": "Own Sign"}
            ],
            "predictions": {
                "personality": "Natural leader with strong willpower. Creative and ambitious nature with good communication skills.",
                "career": "Suitable for leadership roles, business, engineering, or creative fields. Success after age 28.",
                "health": "Generally good health. Watch for stress-related issues. Regular exercise recommended.",
                "relationships": "Harmonious married life. Supportive spouse. Good relationship with family.",
                "finances": "Gradual wealth accumulation. Multiple income sources. Property gains likely."
            },
            "remedies": [
                "Wear Red Coral for Mars strength",
                "Chant Hanuman Chalisa on Tuesdays",
                "Donate red lentils on Saturdays",
                "Worship Lord Ganesha for obstacle removal"
            ],
            "lucky_elements": {
                "numbers": [1, 3, 9, 21],
                "colors": ["Red", "Orange", "Yellow"],
                "days": ["Sunday", "Tuesday", "Thursday"],
                "direction": "East",
                "gemstone": "Red Coral"
            },
            "dasha_periods": {
                "current_dasha": "Jupiter Mahadasha",
                "period": "2020-2036",
                "effects": "Period of growth, wisdom, and spiritual development"
            }
        }

kundli_service = KundliService()