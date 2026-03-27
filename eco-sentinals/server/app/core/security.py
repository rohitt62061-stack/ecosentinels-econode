from jose import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Any
from app.core.config import settings

def create_access_token(subject: str | Any, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a JWT access token for a subject (e.g. ward_id or user_id)."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    """Verifies a JWT token and returns the subject (sub) claim."""
    try:
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return decoded_token["sub"]
    except Exception:
        return None
