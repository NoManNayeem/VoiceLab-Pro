"""API dependencies for authentication and database."""
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from typing import Optional


# Simple session storage (in-memory for POC)
# In production, use Redis or JWT tokens
active_sessions: dict[str, str] = {}


def get_current_user(
    token: Optional[str] = None,
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from session token.
    For POC, we use simple token-based auth.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    username = active_sessions.get(token)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session"
        )
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user


def create_session(username: str) -> str:
    """Create a new session token for user."""
    import uuid
    token = str(uuid.uuid4())
    active_sessions[token] = username
    return token


def delete_session(token: str) -> None:
    """Delete a session token."""
    if token in active_sessions:
        del active_sessions[token]

