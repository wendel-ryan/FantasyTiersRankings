from apscheduler.schedulers.background import BackgroundScheduler
from app.database import SessionLocal
from app.scraping.scrape_service import run_all_scrapers

def run_scraper():
    db = SessionLocal()

    run_all_scrapers(db)
    print("Fantasy rankings updated.")

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(run_scraper, "interval", days=3) 
    scheduler.start()