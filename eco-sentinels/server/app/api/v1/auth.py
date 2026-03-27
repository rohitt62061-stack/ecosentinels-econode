from fastapi import APIRouter, HTTPException, status
from app.core.security import create_access_token
from pydantic import BaseModel

router = APIRouter()

class TokenRequest(BaseModel):
    ward_id: str

@router.post("/token")
async def get_token(request: TokenRequest):
    """
    Generates a JWT access token for a given ward_id.
    In Milestone 1, we skip password verification for simplicity (Mock Auth).
    The ESP32 or Citizen PWA uses this token to authenticate.
    """
    if not request.ward_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ward_id is required to generate a token."
        )
    
    # Create token with ward_id as subject (sub)
    token = create_access_token(subject=request.ward_id)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "ward_id": request.ward_id
    }
