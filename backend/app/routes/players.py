from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.player import Player

router = APIRouter(prefix="/players", tags=["Players"])

@router.get("/")
def get_players(position: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Player)
    if position:
        query = query.filter(Player.position == position)
    return query.order_by(Player.name).all()

@router.get("/{player_id}")
def get_player(player_id: int, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player

@router.post("/")
def add_player(name: str, position: str, team: str | None = None, db: Session = Depends(get_db)):
    player = Player(name=name, position=position, team=team)
    db.add(player)
    db.commit()
    db.refresh(player)
    return player