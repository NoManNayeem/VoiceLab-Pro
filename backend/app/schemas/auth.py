"""Authentication schemas."""
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class LoginRequest(BaseModel):
    """Login request schema."""
    username: str
    password: str


class LoginResponse(BaseModel):
    """Login response schema."""
    access_token: str
    user: "UserResponse"
    message: str = "Login successful"


class UserResponse(BaseModel):
    """User response schema."""
    id: UUID
    username: str
    created_at: datetime
    
    class Config:
        from_attributes = True

