from fastapi import FastAPI, Depends
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
# registers tables with Base.metaData
from .models import user, ranking, player, tier
from app.routes import users, players, rankings, tiers, scrape

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

app.include_router(users.router)
app.include_router(players.router)
app.include_router(rankings.router)
app.include_router(tiers.router)
app.include_router(scrape.router)

@app.get("/")
def root():
    return {"message": "Fantasy Football App backend running:\nDatabase Successfully Connected and Initialized"}

