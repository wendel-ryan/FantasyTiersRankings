from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException
from jose import jwt, JWTError

SECRET_KEY = "9K7w3P8xZ2m5Y9qL1v4N3b8F5h2C6j9P1r8T4y6W1k9V8m3D6xL4n2B7z1K9c3V"
REFRESH_SECRET_KEY = "a8f5c86e24b913d8e27c94a0823e59bfa12d46e8203c94f18392a104c8f5e28a"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)