from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class RankingData(Base):
    #Table data for storing ranking information
    __tablename__ = "rankingData"
    #for each ranking, create a unique ID, reference the source, link a player ID, and establish the rank
    id = Column(Integer, primary_key=True, index=True)
    source = Column(String)
    player_id = Column(Integer, ForeignKey("players.id"))
    player = relationship("Player")
    rank = Column(Integer)