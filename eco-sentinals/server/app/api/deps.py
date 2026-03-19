from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.security import verify_token
from app.repositories.state_repo import StateRepository, get_state_repo
from app.services.sensor_service import SensorService

# For M1, we use a simple header or OAuth2 token bearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

def get_current_ward(token: str = Depends(oauth2_scheme)) -> str:
    """Verifies token and returns the ward_id (subject)."""
    ward_id = verify_token(token)
    if not ward_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return ward_id

def get_sensor_service(state_repo: StateRepository = Depends(get_state_repo)) -> SensorService:
    """Provides SensorService instance."""
    return SensorService(state_repo)
