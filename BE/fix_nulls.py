from sqlalchemy import create_engine, text
from app.core.config import DATABASE_URL, SCHEMA_NAME

def fix_nulls():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        # Fix users table
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.users SET wallet_balance = 0.0 WHERE wallet_balance IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.users SET phone = '' WHERE phone IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.users SET gender = '' WHERE gender IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.users SET date_of_birth = '' WHERE date_of_birth IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.users SET time_of_birth = '' WHERE time_of_birth IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.users SET place_of_birth = '' WHERE place_of_birth IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.users SET occupation = '' WHERE occupation IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.users SET marital_status = '' WHERE marital_status IS NULL"))
        
        # Fix astrologers table
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.astrologers SET is_online = FALSE WHERE is_online IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.astrologers SET is_live = FALSE WHERE is_live IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.astrologers SET total_login_minutes = 0 WHERE total_login_minutes IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.astrologers SET is_boosted = FALSE WHERE is_boosted IS NULL"))
        conn.execute(text(f"UPDATE {SCHEMA_NAME}.astrologers SET followers_count = 0 WHERE followers_count IS NULL"))
        
        conn.commit()
    print("Fixed NULL values in database.")

if __name__ == "__main__":
    fix_nulls()
