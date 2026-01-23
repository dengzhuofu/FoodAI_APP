from pydantic import BaseModel
from typing import List, Dict, Any

class ProfileUpdate(BaseModel):
    preferences: List[str] = []
    allergies: List[str] = []
    health_goals: List[str] = []
    settings: Dict[str, Any] = {}

class ProfileOut(ProfileUpdate):
    user_id: int
    
    class Config:
        from_attributes = True
