from sqlalchemy import create_engine, text, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import DATABASE_URL, SCHEMA_NAME

# Create SQLAlchemy engine
# For PostgreSQL, we can set the search_path to the specified schema
connect_args = {}
if DATABASE_URL.startswith("postgresql"):
    connect_args["options"] = f"-csearch_path={SCHEMA_NAME},public"

engine = create_engine(DATABASE_URL, connect_args=connect_args)

# Create MetaData with the specified schema
metadata = MetaData(schema=SCHEMA_NAME)

# Create Base class for models
Base = declarative_base(metadata=metadata)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to ensure schema exists and create tables
def init_db():
    if DATABASE_URL.startswith("postgresql"):
        try:
            with engine.connect() as conn:
                conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {SCHEMA_NAME}"))
                conn.commit()
                print(f"Schema '{SCHEMA_NAME}' checked/created.")
        except Exception as e:
            print(f"Error creating schema: {e}")
    
    # Tables are created in app/main.py, but we can also do it here or ensure it's called
    from app import models
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")
