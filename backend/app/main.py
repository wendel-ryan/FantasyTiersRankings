from fastapi import FastAPI, Depends
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
# registers tables with Base.metaData
from .models import user, ranking, player

@asynccontextmanager
# Run on application startup
async def lifespan(app: FastAPI):
    # Create tables if they dont already exist
    try:
        Base.metadata.create_all(bind=engine)
        print("Database Tables Created Successfully")
    except Exception as e:
        print(f"Error creating database tables: {e}")
    yield

    pass



app = FastAPI(lifespan=lifespan)

@app.get("/")
def root():
    return {"message": "Fantasy Football App backend running:\nDatabase Successfully Connected and Initialized"}

