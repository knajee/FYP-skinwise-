from datetime import datetime, timedelta, timezone
import bcrypt
import jwt
from src.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except ValueError:
        return False

def get_password_hash(password: str) -> str:
    # bcrypt cost 12
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def create_access_token(subject: str, expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    
    # We use jwt from PyJWT
    # Ensure keys are loaded properly from env
    private_key = settings.JWT_PRIVATE_KEY.get_secret_value()
    # Replace escaped newlines if passed directly in env vars
    private_key = private_key.replace("\\n", "\n")
    
    encoded_jwt = jwt.encode(to_encode, private_key, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt
