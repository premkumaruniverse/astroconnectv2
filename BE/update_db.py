from sqlalchemy import create_engine, text
from app.core.config import DATABASE_URL

def update_database():
    engine = create_engine(DATABASE_URL)
    
    # Try adding columns one by one in separate connections/transactions to avoid aborted transaction state
    queries = [
        ("ALTER TABLE astrologers ADD COLUMN is_online BOOLEAN DEFAULT FALSE", "is_online"),
        ("ALTER TABLE astrologers ADD COLUMN last_online_time TIMESTAMP", "last_online_time"),
        ("ALTER TABLE astrologers ADD COLUMN total_login_minutes INTEGER DEFAULT 0", "total_login_minutes"),
        ("ALTER TABLE astrologers ADD COLUMN is_boosted BOOLEAN DEFAULT FALSE", "is_boosted"),
        ("ALTER TABLE astrologers ADD COLUMN followers_count INTEGER DEFAULT 0", "followers_count"),
        ("ALTER TABLE sessions ADD COLUMN type VARCHAR DEFAULT 'call'", "type (sessions)")
    ]

    for query, col_name in queries:
        with engine.connect() as conn:
            try:
                conn.execute(text(query))
                conn.commit()
                print(f"Added {col_name} column")
            except Exception as e:
                # If error, it's likely duplicate column, just print and move on
                # The connection closes and we get a fresh one next loop
                print(f"Column {col_name} might already exist or error: {e}")

if __name__ == "__main__":
    update_database()
