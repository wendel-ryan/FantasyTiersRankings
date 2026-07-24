from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.scraping.scrape_service import run_all_scrapers, genrateAVGranks
from app.scraping.espn import scrape_espn_rankings
from app.auth.deps import get_current_user


router = APIRouter(prefix="/scrape", tags=["Scraping"])

@router.post("/")
def scrape_data(db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    result = run_all_scrapers(db)
    return result