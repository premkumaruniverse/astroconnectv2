

import os
from pathlib import Path
from dotenv import load_dotenv
import cloudinary

base_dir = Path(__file__).resolve().parent
env_paths = [
    base_dir.parent / ".env",
    base_dir.parent.parent / ".env",
]
for env_path in env_paths:
    load_dotenv(dotenv_path=env_path, override=False)
load_dotenv()

PROJECT_NAME = os.getenv("PROJECT_NAME", "AstroVeda Connect API")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

DATABASE_URL = os.getenv("DATABASE_URL")
# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_TENANT_ID = os.getenv("OPENAI_TENANT_ID")
OPENAI_CLIENT_ID = os.getenv("OPENAI_CLIENT_ID" )
OPENAI_CLIENT_SECRET = os.getenv("OPENAI_CLIENT_SECRET")

# Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)
