from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.ranking import Ranking
from app.models.player import Player

router = APIRouter(prefix="/rankings", tags=["Rankings"])

@router.get("/")
def get_rankings(source: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Ranking)
    if source:
        query = query.filter(Ranking.source == source)
    return query.order_by(Ranking.rank).all()

@router.post("/")
def add_ranking(player_id: int, source: str, rank: int, format: str, db: Session = Depends(get_db)):
    # ensure player exists
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    ranking = Ranking(player_id=player_id, source=source, rank=rank)
    db.add(ranking)
    db.commit()
    db.refresh(ranking)
    return ranking