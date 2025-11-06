"""Authentication routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import LoginRequest, LoginResponse, UserResponse
from app.services.auth_service import validate_credentials, get_or_create_user
from app.api.deps import create_session, delete_session, get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """Login endpoint with hardcoded credentials."""
    # Validate credentials
    if not validate_credentials(credentials.username, credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Get or create user in database
    user = get_or_create_user(db, credentials.username)
    
    # Create session token
    token = create_session(credentials.username)
    
    return LoginResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
        message="Login successful"
    )


@router.post("/logout")
async def logout(
    authorization: str = Header(None)
):
    """Logout endpoint."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        delete_session(token)
    
    return {"message": "Logout successful"}


@router.get("/me", response_model=UserResponse)
async def get_me(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get current authenticated user."""
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    
    user = get_current_user(token=token, db=db)
    return UserResponse.model_validate(user)

