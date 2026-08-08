from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.ranking import Ranking
from app.models.player import Player
from app.auth.deps import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/rankings", tags=["Rankings"])

class RankingsRequest(BaseModel):
    format: str
    source: str

@router.post("/")
def get_rankings(req: RankingsRequest, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    if req.source != "AVG":
        raise HTTPException(status_code=400, detail="Only AVG source supported")

    rankings = (
        db.query(Ranking)
        .join(Player)
        .filter(Ranking.format == req.format)
        .filter(Ranking.source == req.source)
        .order_by(Ranking.rank.asc())
        .all()
    )

    results = [
        {   
            "id": r.player.id,
            "name": r.player.name,
            "team": r.player.team,
            "position": r.player.position,
            "rank": r.rank,
            "image": r.player.image
        }
        for r in rankings
    ]

    return {"rankings": results}
