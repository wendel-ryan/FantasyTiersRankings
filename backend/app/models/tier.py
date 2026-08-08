from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, func
from app.database import Base
from sqlalchemy.orm import relationship


class Tier(Base):
    __tablename__ = "tiers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    position = Column(String, nullable=False)
    format = Column(String, nullable=False)
    tier = Column(Integer, nullable=False)

    player = relationship("Player", back_populates="tiers")