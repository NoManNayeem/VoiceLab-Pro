"""Authentication routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import LoginRequest, LoginResponse, UserResponse
from app.services.auth_service import validate_credentials, get_or_create_user
from app.api.deps import get_current_user
from app.utils.jwt import create_access_token
from app.models.user import User
from app.config import get_settings

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()


@router.post("/login", response_model=LoginResponse)
async def login(
    credentials: LoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    """Login endpoint with JWT token in HTTP-only cookie."""
    # Validate credentials
    if not validate_credentials(credentials.username, credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Get or create user in database
    user = get_or_create_user(db, credentials.username)
    
    # Create JWT access token
    access_token = create_access_token(
        data={"sub": user.username, "user_id": str(user.id)}
    )
    
    # Set HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.environment == "production",  # Only use secure cookies in production
        samesite="lax",
        max_age=60 * 60 * 24 * 7,  # 7 days
        path="/"
    )
    
    return LoginResponse(
        access_token=access_token,  # Also return in response for client-side storage if needed
        user=UserResponse.model_validate(user),
        message="Login successful"
    )


@router.post("/logout")
async def logout(
    response: Response,
    access_token: str = Cookie(None, alias="access_token")
):
    """Logout endpoint - clears the access token cookie."""
    # Create response and clear cookie
    response = JSONResponse(content={"message": "Logout successful"})
    response.delete_cookie(
        key="access_token",
        path="/",
        samesite="lax"
    )
    return response


@router.get("/me", response_model=UserResponse)
async def get_me(
    access_token: str = Cookie(None, alias="access_token"),
    db: Session = Depends(get_db)
):
    """Get current authenticated user from JWT token in cookie."""
    user = get_current_user(token=None, access_token=access_token, db=db)
    return UserResponse.model_validate(user)

