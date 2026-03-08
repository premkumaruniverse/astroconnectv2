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
SECRET_KEY = os.getenv("SECRET_KEY", "lKaPLOQCM1PLUhWFftYOOJ0N_nM")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24)) # 24 hours default or from env

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://myuser:Praveen%402025@13.53.184.50:5432/mydb")
SCHEMA_NAME = os.getenv("SCHEMA_NAME", "astroconnect")

# Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyBkaEY5m-HrbtS4TH1EiF7_gJalgXtPK0A")

# Cloudinary configuration
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "dkx9grys6"),
    api_key=os.getenv("CLOUDINARY_API_KEY", "535455769896777"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", "lKaPLOQCM1PLUhWFftYOOJ0N_nM"),
    secure=True,
)