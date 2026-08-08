from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.player import Player
from app.models.tier import Tier
from app.models.ranking import Ranking
from app.auth.deps import get_current_user
from pydantic import BaseModel
from app.auth.jwt import create_access_token
from sqlalchemy import delete


router = APIRouter(prefix="/tiers", tags=["Tiers"])

@router.get("/")
def get_tiers(db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    query = (
        db.query(Tier, Player, Ranking)
        .join(Tier.player)
        .join(
            Ranking,
            (Ranking.player_id == Player.id)
            & (Ranking.source == "AVG")
            & (Ranking.format == Tier.format)
        )
        .filter(Tier.user_id == user_id)
        .order_by( Player.position, Tier.tier, Ranking.rank)
    )
    results = query.all()   
    return [
        {
            "tier": tier.tier,
            "format": tier.format,
            "rank": ranking.rank,  # assuming Ranking has a 'rank' column
            "id": player.id,
            "name": player.name,
            "team": player.team,
            "position": player.position
        }
        for tier, player, ranking in results
    ]

class TierCreate(BaseModel):
    player_id: int
    position: str
    format: str
    tier: int

class TierList(BaseModel):
    tiers: list[TierCreate]

@router.post("/load-tiers")
def addTiers(data: TierList, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    db.query(Tier).filter(Tier.user_id == user_id).delete();

    for tier in data.tiers:
        db_tier = Tier(
            user_id = user_id,
            player_id = tier.player_id,
            position = tier.position,
            format = tier.format,
            tier = tier.tier
        )
        db.add(db_tier)

    # Commit all new tiers to the database
    db.commit()
    db.refresh(db_tier)

    return {"message": "Tiers successfully added", "count": len(data.tiers), "user":user_id}