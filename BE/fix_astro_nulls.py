from sqlalchemy import create_engine, text
from app.core.config import DATABASE_URL, SCHEMA_NAME

def fix_astrologer_nulls():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        # Professional stats and dashboard features
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.astrologers SET status = 'pending' WHERE status IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.astrologers SET verification_status = 'pending' WHERE verification_status IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.astrologers SET rating = 0.0 WHERE rating IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.astrologers SET total_calls = 0 WHERE total_calls IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.astrologers SET earnings = 0.0 WHERE earnings IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.astrologers SET rate = 10.0 WHERE rate IS NULL"))
        
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.astrologers SET is_online = FALSE WHERE is_online IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.astrologers SET is_live = FALSE WHERE is_live IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.astrologers SET total_login_minutes = 0 WHERE total_login_minutes IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.astrologers SET is_boosted = FALSE WHERE is_boosted IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.astrologers SET followers_count = 0 WHERE followers_count IS NULL"))
        
        # AstrologerApplication required fields
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.astrologers SET specialties = '{{}}' WHERE specialties IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.astrologers SET languages = '{{}}' WHERE languages IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.astrologers SET bio = '' WHERE bio IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.astrologers SET phone = '' WHERE phone IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.astrologers SET experience = 0 WHERE experience IS NULL"))
        
        conn.commit()
    print("Fixed NULL values in astrologers table.")

if __name__ == "__main__":
    fix_astrologer_nulls()
