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
        
        if not GEMINI_API_KEY:
            raise Exception("GEMINI_API_KEY is not configured.")

        try:
            # Make actual LLM call
            prompt = f"""
            Generate today's astrological insights for {today}. Return JSON with:
            {{
                "cosmic_energy": {{
                    "level": "High/Medium/Low", 
                    "description": "...", 
                    "dominant_planet": "...",
                    "energy_color": "..."
                }},
                "daily_prediction": {{
                    "overall": "...", 
                    "love": "...", 
                    "career": "...", 
                    "health": "...", 
                    "finance": "..."
                }},
                "lucky_elements": {{
                    "number": 1-9, 
                    "color": "...", 
                    "direction": "...",
                    "time": "e.g. 10:00 AM - 12:00 PM",
                    "gemstone": "..."
                }},
                "do_today": ["...", "..."],
                "avoid_today": ["...", "..."],
                "mantra_of_day": "...",
                "spiritual_advice": "..."
            }}
            """
            
            # Initialize Gemini with LangChain
            llm = ChatGoogleGenerativeAI(
                model="gemini-flash-latest",
                google_api_key=GEMINI_API_KEY,
                temperature=0.7
            )
            
            response = llm.invoke(prompt)
            content = response.content.strip()
            
            # Remove markdown code blocks if present
            if content.startswith('```json'):
                content = content.replace('```json', '').replace('```', '').strip()
            elif content.startswith('```'):
                content = content.replace('```', '').strip()
            
            llm_data = json.loads(content)
            
            # Add missing fields
            llm_data["date"] = today
            if "planetary_transits" not in llm_data:
                llm_data["planetary_transits"] = []
            
            return llm_data
                
        except Exception as e:
            print(f"[LOG] Today insights generation failed: {e}")
            raise Exception(f"Failed to generate today's insights from AI: {str(e)}")

today_service = TodayService()
