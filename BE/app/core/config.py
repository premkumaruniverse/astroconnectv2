import os

# Application Configuration
PROJECT_NAME = os.getenv("PROJECT_NAME", "AstroVeda Connect API")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30)
)

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL")

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")