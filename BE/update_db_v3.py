from sqlalchemy import create_engine, text, inspect
from app.core.config import DATABASE_URL, SCHEMA_NAME

def update_database():
    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)
    
    # 1. Update users table
    users_cols = [
        ("phone", "VARCHAR"),
        ("gender", "VARCHAR"),
        ("date_of_birth", "VARCHAR"),
        ("time_of_birth", "VARCHAR"),
        ("place_of_birth", "VARCHAR"),
        ("occupation", "VARCHAR"),
        ("marital_status", "VARCHAR")
    ]
    
    existing_users_cols = [c['name'] for c in inspector.get_columns('users', schema=SCHEMA_NAME)]
    
    for col_name, col_type in users_cols:
        if col_name not in existing_users_cols:
            try:
                with engine.connect() as conn:
                    conn.execute(text(f"ALTER TABLE {SCHEMA_NAME}.users ADD COLUMN {col_name} {col_type}"))
                    conn.commit()
                    print(f"Added column '{col_name}' to 'users' table.")
            except Exception as e:
                print(f"Error adding '{col_name}': {e}")
        else:
            print(f"Column '{col_name}' already exists in 'users' table.")

    # 2. Update astrologers table (ensure all features exist)
    astro_cols = [
        ("is_online", "BOOLEAN DEFAULT FALSE"),
        ("is_live", "BOOLEAN DEFAULT FALSE"),
        ("last_online_time", "TIMESTAMP"),
        ("total_login_minutes", "INTEGER DEFAULT 0"),
        ("is_boosted", "BOOLEAN DEFAULT FALSE"),
        ("followers_count", "INTEGER DEFAULT 0")
    ]
    
    existing_astro_cols = [c['name'] for c in inspector.get_columns('astrologers', schema=SCHEMA_NAME)]
    
    for col_name, col_type in astro_cols:
        if col_name not in existing_astro_cols:
            try:
                with engine.connect() as conn:
                    conn.execute(text(f"ALTER TABLE {SCHEMA_NAME}.astrologers ADD COLUMN {col_name} {col_type}"))
                    conn.commit()
                    print(f"Added column '{col_name}' to 'astrologers' table.")
            except Exception as e:
                print(f"Error adding '{col_name}' to 'astrologers': {e}")
        else:
            print(f"Column '{col_name}' already exists in 'astrologers' table.")

if __name__ == "__main__":
    update_database()
