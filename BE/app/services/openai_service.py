import httpx
import json
import asyncio
from datetime import datetime
from typing import Dict, Any, List
from app.core.config import OPENROUTER_API_KEY, OPENROUTER_URL, SITE_URL, PROJECT_NAME

class OpenAIService:
    def __init__(self):
        pass
    
    async def generate_daily_panchang(self, date: str = None) -> Dict[str, Any]:
        """Generate daily panchang using OpenRouter API"""
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")
        
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
            headers = {
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": SITE_URL,
                "X-Title": PROJECT_NAME,
                "Content-Type": "application/json"
            }
            
            models = [
                "google/gemini-2.0-flash-exp:free",
                "google/gemini-2.0-pro-exp-02-05:free",
                "mistralai/mistral-7b-instruct:free",
                "huggingfaceh4/zephyr-7b-beta:free",
                "meta-llama/llama-3-8b-instruct:free"
            ]
            
            async with httpx.AsyncClient() as client:
                for model in models:
                    try:
                        data = {
                            "model": model,
                            "messages": [
                                {"role": "system", "content": "You are an expert Vedic Astrologer. You provide accurate Panchang data in strict JSON format."},
                                {"role": "user", "content": prompt}
                            ],
                            "response_format": {"type": "json_object"}
                        }
                        
                        print(f"Calling OpenRouter API with model: {model}")
                        response = await client.post(
                            OPENROUTER_URL, 
                            headers=headers, 
                            json=data, 
                            timeout=60.0
                        )
                        
                        if response.status_code == 200:
                            print(f"OpenRouter API success with {model}")
                            result = response.json()
                            content = result['choices'][0]['message']['content']
                            
                            # Clean up content if it contains markdown code blocks
                            if "```json" in content:
                                content = content.split("```json")[1].split("```")[0].strip()
                            elif "```" in content:
                                content = content.split("```")[1].strip()
                                
                            try:
                                parsed_data = json.loads(content)
                                if isinstance(parsed_data, list):
                                    if len(parsed_data) > 0:
                                        parsed_data = parsed_data[0]
                                    else:
                                        print(f"Model {model} returned empty list, trying next...")
                                        continue
                                return parsed_data
                            except json.JSONDecodeError:
                                print(f"Model {model} returned invalid JSON, trying next...")
                                continue
                                
                        elif response.status_code == 429:
                             print(f"Model {model} rate limited, trying next...")
                             await asyncio.sleep(1)
                             continue
                        else:
                            print(f"Model {model} failed with {response.status_code} - {response.text}")
                            continue
                            
                    except httpx.RequestError as e:
                        print(f"Network error with {model}: {e}")
                        continue
                
                print("All models failed, returning mock Panchang data")
                raise Exception("All models failed")
                
        except Exception as e:
            print(f"Panchang generation error: {e}")
            print("Falling back to mock Panchang data")
            return {
                "date": date,
                "tithi": "Shukla Paksha Dashami",
                "nakshatra": "Rohini",
                "yog": "Siddhi",
                "karan": "Taitila",
                "sunrise": "06:30 AM",
                "sunset": "06:45 PM",
                "moonrise": "02:15 PM",
                "moonset": "03:45 AM",
                "auspicious_time": "Abhijit Muhurat: 11:45 AM - 12:30 PM",
                "inauspicious_time": "Rahu Kaal: 04:30 PM - 06:00 PM",
                "description": "Today is a favorable day for new beginnings. The alignment suggests positive energy for creative pursuits."
            }

    async def generate_daily_horoscope(self, date: str = None) -> List[Dict[str, str]]:
        """Generate daily horoscope for all signs using OpenRouter API"""
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")
            
        prompt = f"""
        Generate daily horoscope predictions for all 12 zodiac signs for date: {date}.
        
        You must return ONLY a valid JSON array of objects. Do not include any markdown formatting like ```json ... ```.
        The JSON structure must be exactly as follows:
        [
            {{ "sign": "Aries", "prediction": "Prediction text..." }},
            {{ "sign": "Taurus", "prediction": "Prediction text..." }},
            ...
        ]
        
        Keep predictions concise (2-3 sentences) and positive/constructive.
        """
        
        try:
            headers = {
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": SITE_URL,
                "X-Title": PROJECT_NAME,
                "Content-Type": "application/json"
            }
            
            models = [
                "google/gemini-2.0-flash-exp:free",
                "google/gemini-2.0-pro-exp-02-05:free",
                "mistralai/mistral-7b-instruct:free",
                "huggingfaceh4/zephyr-7b-beta:free",
                "meta-llama/llama-3-8b-instruct:free"
            ]
            
            async with httpx.AsyncClient() as client:
                for model in models:
                    try:
                        data = {
                            "model": model,
                            "messages": [
                                {"role": "system", "content": "You are an expert Astrologer. Provide JSON output only."},
                                {"role": "user", "content": prompt}
                            ],
                            "response_format": {"type": "json_object"}
                        }
                        
                        print(f"Calling OpenRouter API for Horoscope with model: {model}")
                        response = await client.post(
                            OPENROUTER_URL, 
                            headers=headers, 
                            json=data, 
                            timeout=60.0
                        )
                        
                        if response.status_code == 200:
                            print(f"OpenRouter API success with {model}")
                            result = response.json()
                            content = result['choices'][0]['message']['content']
                            
                            if "```json" in content:
                                content = content.split("```json")[1].split("```")[0].strip()
                            elif "```" in content:
                                content = content.split("```")[1].strip()
                                
                            try:
                                parsed_data = json.loads(content)
                                # Expecting a list
                                if isinstance(parsed_data, dict):
                                    # Sometimes models wrap list in a dict key like "horoscopes": [...]
                                    for key in parsed_data:
                                        if isinstance(parsed_data[key], list):
                                            parsed_data = parsed_data[key]
                                            break
                                            
                                if not isinstance(parsed_data, list):
                                    print(f"Model {model} returned non-list data, trying next...")
                                    continue
                                    
                                return parsed_data
                            except json.JSONDecodeError:
                                print(f"Model {model} returned invalid JSON, trying next...")
                                continue
                                
                        elif response.status_code == 429:
                             print(f"Model {model} rate limited, trying next...")
                             await asyncio.sleep(1)
                             continue
                        else:
                            print(f"Model {model} failed with {response.status_code} - {response.text}")
                            continue
                            
                    except httpx.RequestError as e:
                        print(f"Network error with {model}: {e}")
                        continue
                
                print("All models failed, returning mock horoscope data")
                raise Exception("All models failed")
                
        except Exception as e:
            print(f"Horoscope generation error: {e}")
            print("Falling back to mock Horoscope data")
            return [
                {"sign": "Aries", "prediction": "Today brings new opportunities. Stay focused on your goals."},
                {"sign": "Taurus", "prediction": "Financial gains are likely. Spend time with family."},
                {"sign": "Gemini", "prediction": "Communication is key today. Express yourself clearly."},
                {"sign": "Cancer", "prediction": "Take care of your health. A peaceful day ahead."},
                {"sign": "Leo", "prediction": "Your leadership skills will be appreciated. Be confident."},
                {"sign": "Virgo", "prediction": "Focus on details. Hard work will pay off."},
                {"sign": "Libra", "prediction": "Balance is important. Avoid conflicts."},
                {"sign": "Scorpio", "prediction": "Trust your intuition. A transformation is coming."},
                {"sign": "Sagittarius", "prediction": "Adventure awaits. Embrace new experiences."},
                {"sign": "Capricorn", "prediction": "Career growth is indicated. Stay disciplined."},
                {"sign": "Aquarius", "prediction": "Innovation will help you. Think outside the box."},
                {"sign": "Pisces", "prediction": "Listen to your inner voice. Creative energy is high."}
            ]

openai_service = OpenAIService()
