from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[EmailStr] = None
    nickname: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: Optional[str]
    nickname: str
    avatar: Optional[str]
    is_pro: bool
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    nickname: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class WhatToEatPresetCreate(BaseModel):
    name: str
    options: List[str]

class WhatToEatPresetOut(BaseModel):
    id: int
    name: str
    options: List[str]
    
    class Config:
        from_attributes = True
