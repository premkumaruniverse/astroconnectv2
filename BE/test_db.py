import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import certifi

load_dotenv()

async def test_connection():
    uri = os.getenv("MONGO_URI")
    print(f"Testing connection to: {uri[:20]}...")
    
    try:
        # Try with invalid certs allowed for debugging
        client = AsyncIOMotorClient(uri, tls=True, tlsAllowInvalidCertificates=True)
        # Force a connection verification
        await client.admin.command('ping')
        print("Successfully connected to MongoDB!")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
