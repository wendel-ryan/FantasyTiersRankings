from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.scraping.scrape_service import run_all_scrapers, genrateAVGranks
from app.scraping.espn import scrape_espn_rankings

router = APIRouter(prefix="/scrape", tags=["Scraping"])

@router.post("/")
def scrape_data(db: Session = Depends(get_db)):
    result = run_all_scrapers(db)
    return result