"""Authentication service."""
import json
import os
from pathlib import Path
from typing import Optional
from app.schemas.auth import UserResponse
from app.models.user import User
from sqlalchemy.orm import Session
import uuid


def load_credentials() -> dict:
    """Load hardcoded credentials from JSON file."""
    credentials_path = Path(__file__).parent.parent / "utils" / "credentials.json"
    with open(credentials_path, "r") as f:
        return json.load(f)


def validate_credentials(username: str, password: str) -> bool:
    """Validate user credentials against hardcoded JSON file."""
    credentials = load_credentials()
    for user in credentials.get("users", []):
        if user.get("username") == username and user.get("password") == password:
            return True
    return False


def get_or_create_user(db: Session, username: str) -> User:
    """Get existing user or create new one in database."""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = User(username=username)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get user by username."""
    return db.query(User).filter(User.username == username).first()

