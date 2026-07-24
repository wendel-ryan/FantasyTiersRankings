from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.player import Player
from app.models.tier import Tier
from app.auth.deps import get_current_user


router = APIRouter(prefix="/tiers", tags=["Tiers"])

@router.get("/")
def get_tiers(position: str | None = None, scoring_format: str = "PPR", db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    query = db.query(Tier).join(Player)
    query = query.filter(Tier.scoring_format == scoring_format)

    if position:
        query = query.filter(Player.position == position)

    return query.order_by(Tier.tier, Player.name).all()


@router.post("/override")
def override_tier(player_id: int, tier: int, scoring_format: str = "PPR", db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    existing = db.query(Tier).filter(
        Tier.player_id == player_id,
        Tier.scoring_format == scoring_format
    ).first()

    if existing:
        existing.tier = tier
        existing.is_manual = True
    else:
        new_tier = Tier(
            player_id=player_id,
            position=player.position,
            scoring_format=scoring_format,
            tier=tier,
            is_manual=True
        )
        db.add(new_tier)

    db.commit()
    return {"status": "ok", "player_id": player_id, "tier": tier}