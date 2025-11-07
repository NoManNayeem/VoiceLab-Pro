"""API dependencies for authentication and database."""
from fastapi import Depends, HTTPException, status, Cookie, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.jwt import decode_access_token, get_username_from_token
from typing import Optional


def get_current_user(
    token: Optional[str] = None,
    access_token: Optional[str] = Cookie(None, alias="access_token"),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token.
    Token can come from Authorization header or cookie.
    """
    # Try to get token from cookie first, then from Authorization header
    jwt_token = access_token or token
    
    if not jwt_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Decode JWT token
    username = get_username_from_token(jwt_token)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Get user from database
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user


def get_current_user_from_request(request: Request, db: Session = Depends(get_db)) -> User:
    """
    Get current authenticated user from request (for use in dependencies).
    Checks both Authorization header and cookies.
    """
    # Check Authorization header
    token = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    
    # Check cookie
    access_token = request.cookies.get("access_token")
    jwt_token = access_token or token
    
    if not jwt_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    username = get_username_from_token(jwt_token)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

