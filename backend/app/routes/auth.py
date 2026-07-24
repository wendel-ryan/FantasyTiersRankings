from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.auth.hash import hash_password, verify_password
from app.auth.jwt import create_access_token
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordRequestForm


router = APIRouter()

class UserCreate(BaseModel):
    email: str
    password: str

#add user
@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email ==user.email).one_or_none()
    if existing_user:
        return {"msg": "Email already registered"}
    
    user = User(email=user.email, hashed_password=hash_password(user.password))
    db.add(user)
    db.commit()
    return {"msg": "User created"}


@router.post("/login")
def login(userData: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == userData.email).first()

    if not user or not verify_password(userData.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/new-password")
def resestPassword(userData: UserCreate,  db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == userData.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = hash_password(userData.password)
    db.commit()
    return {"msg": "Password Updated"}