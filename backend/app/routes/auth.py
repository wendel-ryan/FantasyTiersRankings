from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.auth.hash import hash_password, verify_password
from app.auth.jwt import create_access_token, create_refresh_token, REFRESH_TOKEN_EXPIRE_DAYS, REFRESH_SECRET_KEY, ALGORITHM
from jose import jwt, JWTError, ExpiredSignatureError
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse

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

    # Create both tokens
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    # Store refresh token securely in HTTP-only cookie
    response = JSONResponse(
        content={"access_token": access_token, "token_type": "bearer"}
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="None",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )

    return response

@router.post("/new-password")
def resestPassword(userData: UserCreate,  db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == userData.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = hash_password(userData.password)
    db.commit()
    return {"msg": "Password Updated"}

@router.post("/refresh")
def refresh_token(request: Request):
    # Get refresh token from cookie
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        print('Missing refresh token')
        raise HTTPException(status_code=401, detail="Missing refresh token")

    try:
        # Decode and validate refresh token
        payload = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid refresh token payload")

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # Create new access token
    new_access_token = create_access_token({"sub": user_id})

    return {"access_token": new_access_token, "token_type": "bearer"}