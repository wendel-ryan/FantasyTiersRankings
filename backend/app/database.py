from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    pool_size=10,          # steady baseline for moderate traffic
    max_overflow=20,       # allows bursts during peak season
    pool_timeout=30,       # seconds to wait before giving up on a connection
    pool_recycle=1800,     # recycle connections every 30 minutes to avoid stale ones
    pool_pre_ping=True,    # automatically checks if connections are alive
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()