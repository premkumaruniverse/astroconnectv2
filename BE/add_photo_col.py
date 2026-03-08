from sqlalchemy import create_engine, text
from app.core.config import DATABASE_URL, SCHEMA_NAME

def add_profile_image():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        try:
            conn.execute(text(f"ALTER TABLE {SCHEMA_NAME}.users ADD COLUMN profile_image VARCHAR"))
            conn.commit()
            print("Added profile_image to users")
        except Exception as e:
            print(f"Users table error: {e}")
            
        try:
            conn.execute(text(f"ALTER TABLE {SCHEMA_NAME}.astrologers ADD COLUMN profile_image VARCHAR"))
            conn.commit()
            print("Added profile_image to astrologers")
        except Exception as e:
            print(f"Astrologers table error: {e}")

if __name__ == "__main__":
    add_profile_image()
