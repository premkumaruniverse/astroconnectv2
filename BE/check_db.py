from sqlalchemy import create_engine, text, inspect
from app.core.config import DATABASE_URL, SCHEMA_NAME

def check_tables():
    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)
    tables = inspector.get_table_names(schema=SCHEMA_NAME)
    print(f"Tables in schema '{SCHEMA_NAME}':")
    for table in tables:
        print(f"- {table}")
        columns = inspector.get_columns(table, schema=SCHEMA_NAME)
        for col in columns:
            print(f"  * {col['name']}: {col['type']}")

if __name__ == "__main__":
    check_tables()
