from sqlalchemy import create_engine, text
from app.core.config import DATABASE_URL

def update_database():
    engine = create_engine(DATABASE_URL)
    
    queries = [
        ("ALTER TABLE users ADD COLUMN date_of_birth VARCHAR", "date_of_birth"),
        ("ALTER TABLE users ADD COLUMN time_of_birth VARCHAR", "time_of_birth"),
        ("ALTER TABLE users ADD COLUMN place_of_birth VARCHAR", "place_of_birth"),
        ("ALTER TABLE astrologers ADD COLUMN is_live BOOLEAN DEFAULT FALSE", "is_live")
    ]

    for query, col_name in queries:
        with engine.connect() as conn:
            try:
                conn.execute(text(query))
                conn.commit()
                print(f"Added {col_name} column")
            except Exception as e:
                print(f"Column {col_name} might already exist or error: {e}")

if __name__ == "__main__":
    update_database()
