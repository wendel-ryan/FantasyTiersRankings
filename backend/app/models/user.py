from sqlalchemy import Column, Integer, String
from app.database import Base

class User(Base):
    #Table data for storing user information
    __tablename__ = "users"
    #for each user, store a unique ID, email, and a hashed password
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String(128))