from pydantic import BaseModel
from datetime import date
from typing import Optional

class HealthProfileCreate(BaseModel):
    height: float
    weight: float

class HealthProfileResponse(HealthProfileCreate):
    daily_calorie_target: Optional[int] = None
    dietary_advice: Optional[str] = None
    exercise_advice: Optional[str] = None
    
    class Config:
        from_attributes = True

class CheckInCreate(BaseModel):
    date: date
    breakfast_content: Optional[str] = None
    lunch_content: Optional[str] = None
    dinner_content: Optional[str] = None
    exercise_content: Optional[str] = None
    total_calories_in: Optional[int] = None
    total_calories_burned: Optional[int] = None

class CheckInResponse(CheckInCreate):
    id: int
    status: str
    
    class Config:
        from_attributes = True

class AICalorieCalculationRequest(BaseModel):
    breakfast_content: Optional[str] = None
    lunch_content: Optional[str] = None
    dinner_content: Optional[str] = None
    exercise_content: Optional[str] = None

class AICalorieCalculationResponse(BaseModel):
    total_calories_in: int
    total_calories_burned: int
    breakdown: Optional[str] = None
