from fastapi import APIRouter
from app.schemas.chat import ChatMessage
import google.generativeai as genai
import random
from app.core.config import GEMINI_API_KEY

router = APIRouter()

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-flash-latest')
else:
    model = None

def get_fallback_response():
    responses = [
        "The stars align in your favor, but patience is required. Jupiter's influence suggests growth through wisdom.",
        "Your query resonates with the energy of the Moon. Emotional clarity will come soon. Meditate on your inner truth.",
        "Saturn's transit indicates a time of discipline. Hard work now will yield lasting rewards in the future.",
        "The cosmic alignment suggests a time of transformation. Embrace change as the universe guides you towards your true path.",
        "Mercury is strong in your chart right now. It is an excellent time for communication and learning new skills.",
        "Venus blesses you with harmony. Focus on relationships and creativity to unlock your full potential.",
        "Rahu's energy may bring confusion, but it is an illusion. Trust your intuition and stay grounded.",
        "The Sun shines bright on your destiny. Leadership and confidence will open new doors for you.",
        "Mars gives you the courage to overcome obstacles. Channel your energy wisely and avoid impulsive actions.",
        "Ketu asks you to let go of the past. Spiritual liberation comes from detachment and acceptance."
    ]
    return f"AI Guru: {random.choice(responses)}"

@router.post("/")
async def chat_with_guru(message: ChatMessage):
    try:
        if not GEMINI_API_KEY or model is None:
             return {"response": "My inner eye (API Key) is not yet opened. Please configure the environment."}

        system_prompt = (
            "You are an enlightened Vedic Astrologer AI Guru. "
            "Your purpose is to provide guidance based on Vedic astrology, spirituality, and cosmic wisdom. "
            "You must STRICTLY refuse to answer any questions that are not related to astrology, spirituality, mental well-being, or life guidance through a Vedic lens. "
            "If a user asks about coding, math, politics, or other unrelated topics, gently guide them back to the stars. "
            "Be wise, empathetic, and mystical but practical."
        )
        
        user_content = message.user_message
        if message.birth_details:
            user_content = f"User Birth Details: {message.birth_details}\n\nUser Question: {user_content}"
        
        # Using Gemini to generate response
        # We can pass the system prompt as part of the context or instructions
        chat = model.start_chat(history=[])
        response = chat.send_message(f"{system_prompt}\n\nUser Question: {user_content}")
        
        return {"response": response.text}
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return {"response": get_fallback_response()}
