from typing import Dict, Any
from datetime import datetime
from app.core.config import GEMINI_API_KEY
import json
from langchain_google_genai import ChatGoogleGenerativeAI

class TodayService:
    
    async def generate_today_insights(self) -> Dict[str, Any]:
        """Generate today's astrological insights using Gemini LLM"""
        print("[LOG] TodayService.generate_today_insights called")
        
        today = datetime.now().strftime("%Y-%m-%d")
        print(f"[LOG] Generating insights for date: {today}")
        
        try:
            print("[LOG] Attempting Gemini LLM call for today insights")
            
            # Make actual LLM call
            prompt = f"""
            Generate today's astrological insights for {today}. Return JSON with:
            {{
                "cosmic_energy": {{"level": "High/Medium/Low", "description": "...", "dominant_planet": "..."}},
                "daily_prediction": {{"overall": "...", "love": "...", "career": "...", "health": "...", "finance": "..."}},
                "lucky_elements": {{"number": 1-9, "color": "...", "direction": "..."}},
                "do_today": ["...", "..."],
                "avoid_today": ["...", "..."],
                "mantra_of_day": "...",
                "spiritual_advice": "..."
            }}
            """
            
            # Initialize Gemini with LangChain
            llm = ChatGoogleGenerativeAI(
                model="gemini-2.5-flash",
                google_api_key=GEMINI_API_KEY,
                temperature=0.7
            )
            print(f"[LOG] Gemini LangChain configured: {'Yes' if GEMINI_API_KEY else 'No'}")
            
            print("[LOG] Making Gemini API call via LangChain...")
            response = llm.invoke(prompt)
            
            content = response.content.strip()
            print(f"[LOG] Gemini response received: {len(content)} characters")
            
            try:
                # Remove markdown code blocks if present
                if content.startswith('```json'):
                    content = content.replace('```json', '').replace('```', '').strip()
                elif content.startswith('```'):
                    content = content.replace('```', '').strip()
                
                llm_data = json.loads(content)
                print("[LOG] Successfully parsed Gemini JSON response")
                
                # Add missing fields
                llm_data["date"] = today
                if "planetary_transits" not in llm_data:
                    llm_data["planetary_transits"] = [
                        {"planet": "Moon", "sign": "Leo", "effect": "Boosts confidence"}
                    ]
                
                return llm_data
                
            except json.JSONDecodeError as e:
                print(f"[LOG] Failed to parse Gemini JSON: {e}")
                print(f"[LOG] Raw Gemini response: {content[:200]}...")
                result = self._generate_daily_insights(today)
                return result
                
        except Exception as e:
            print(f"[LOG] Gemini call failed: {e}")
            result = self._generate_daily_insights(today)
            return result
        except Exception as e:
            print(f"[LOG] Error in generate_today_insights: {e}")
            import traceback
            traceback.print_exc()
            return self._generate_daily_insights(today)
    
    def _generate_daily_insights(self, date: str) -> Dict[str, Any]:
        """Generate comprehensive daily insights"""
        print(f"[LOG] _generate_daily_insights called with date: {date}")
        print("[LOG] Using STATIC/FALLBACK data (not LLM)")
        return {
            "date": date,
            "cosmic_energy": {
                "level": "High",
                "description": "Strong planetary alignments favor new beginnings and important decisions today.",
                "dominant_planet": "Jupiter",
                "energy_color": "Golden Yellow"
            },
            "daily_prediction": {
                "overall": "Today brings opportunities for growth and positive changes. Trust your intuition.",
                "love": "Express your feelings openly. Single? Someone special may enter your life.",
                "career": "Excellent day for presentations, meetings, and career advancement.",
                "health": "Energy levels are high. Good time for physical activities and wellness routines.",
                "finance": "Favorable for investments and financial planning. Avoid impulsive purchases."
            },
            "lucky_elements": {
                "number": 7,
                "color": "Golden Yellow",
                "direction": "Northeast",
                "time": "10:00 AM - 12:00 PM",
                "gemstone": "Yellow Sapphire"
            },
            "planetary_transits": [
                {"planet": "Moon", "sign": "Leo", "effect": "Boosts confidence and leadership qualities"},
                {"planet": "Mercury", "sign": "Virgo", "effect": "Enhances communication and analytical thinking"},
                {"planet": "Venus", "sign": "Libra", "effect": "Brings harmony in relationships"}
            ],
            "do_today": [
                "Start new projects or ventures",
                "Have important conversations",
                "Practice gratitude and meditation",
                "Wear yellow or golden colors",
                "Donate to charity"
            ],
            "avoid_today": [
                "Making hasty decisions after 6 PM",
                "Lending money to others",
                "Starting arguments or conflicts",
                "Wearing black or dark colors",
                "Traveling towards the South"
            ],
            "mantra_of_day": "Om Gam Ganapataye Namaha",
            "spiritual_advice": "Focus on your goals with determination. The universe is aligning to support your dreams."
        }

today_service = TodayService()