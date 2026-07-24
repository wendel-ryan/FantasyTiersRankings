from sqlalchemy import Column, Integer, String
from app.database import Base
from sqlalchemy.orm import relationship

class Player(Base):
    #Table data for storing player information
    __tablename__ = "players"
    #for each player, create a unique ID, store their name, store their team, and store their postion
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    team = Column(String)
    position = Column(String)
    image = Column(String)

    rankings = relationship("Ranking", back_populates="player")