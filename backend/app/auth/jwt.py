from datetime import datetime, timezone, timedelta
from jose import jwt

SECRET_KEY = "9K7w3P8xZ2m5Y9qL1v4N3b8F5h2C6j9P1r8T4y6W1k9V8m3D6xL4n2B7z1K9c3V"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)