from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, func
from app.database import Base
from sqlalchemy.orm import relationship


class Tier(Base):
    __tablename__ = "tiers"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    scoring_format = Column(String, nullable=False)
    tier = Column(Integer, nullable=False)
    is_manual = Column(Boolean, default=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
