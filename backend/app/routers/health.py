from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import date

from app.core.deps import get_current_user
from app.models.users import User
from app.models.health import HealthProfile, DailyCheckIn
from app.schemas.health import (
    HealthProfileCreate, HealthProfileResponse,
    CheckInCreate, CheckInResponse,
    AICalorieCalculationRequest, AICalorieCalculationResponse
)
from app.services.health_ai_service import health_ai_service

router = APIRouter()

@router.get("/profile", response_model=Optional[HealthProfileResponse])
async def get_health_profile(
    current_user: User = Depends(get_current_user)
):
    profile = await HealthProfile.get_or_none(user=current_user)
    if not profile:
        return None
    return profile

@router.post("/profile", response_model=HealthProfileResponse)
async def create_or_update_health_profile(
    data: HealthProfileCreate,
    current_user: User = Depends(get_current_user)
):
    # Call AI to calculate target and advice
    ai_result = await health_ai_service.calculate_health_profile(data.height, data.weight)
    
    profile = await HealthProfile.get_or_none(user=current_user)
    if profile:
        profile.height = data.height
        profile.weight = data.weight
        profile.daily_calorie_target = ai_result.get("daily_calorie_target", 2000)
        profile.dietary_advice = ai_result.get("dietary_advice", "")
        profile.exercise_advice = ai_result.get("exercise_advice", "")
        await profile.save()
    else:
        profile = await HealthProfile.create(
            user=current_user,
            height=data.height,
            weight=data.weight,
            daily_calorie_target=ai_result.get("daily_calorie_target", 2000),
            dietary_advice=ai_result.get("dietary_advice", ""),
            exercise_advice=ai_result.get("exercise_advice", "")
        )
    return profile

@router.get("/checkins", response_model=List[CheckInResponse])
async def get_checkins(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user)
):
    query = DailyCheckIn.filter(user=current_user)
    if start_date:
        query = query.filter(date__gte=start_date)
    if end_date:
        query = query.filter(date__lte=end_date)
    return await query.all()

@router.post("/checkins", response_model=CheckInResponse)
async def create_checkin(
    data: CheckInCreate,
    current_user: User = Depends(get_current_user)
):
    # Get user profile for daily target
    profile = await HealthProfile.get_or_none(user=current_user)
    target = profile.daily_calorie_target if profile else 2000
    
    # Calculate Status
    # Net calories = Intake - Burned
    net = (data.total_calories_in or 0) - (data.total_calories_burned or 0)
    
    status = "white"
    if net > target:
        if net > target * 1.2:
            status = "red"
        else:
            status = "orange"
            
    # Check if checkin exists for date
    checkin = await DailyCheckIn.get_or_none(user=current_user, date=data.date)
    if checkin:
        checkin.breakfast_content = data.breakfast_content
        checkin.lunch_content = data.lunch_content
        checkin.dinner_content = data.dinner_content
        checkin.exercise_content = data.exercise_content
        checkin.total_calories_in = data.total_calories_in or 0
        checkin.total_calories_burned = data.total_calories_burned or 0
        checkin.status = status
        await checkin.save()
    else:
        checkin = await DailyCheckIn.create(
            user=current_user,
            date=data.date,
            breakfast_content=data.breakfast_content,
            lunch_content=data.lunch_content,
            dinner_content=data.dinner_content,
            exercise_content=data.exercise_content,
            total_calories_in=data.total_calories_in or 0,
            total_calories_burned=data.total_calories_burned or 0,
            status=status
        )
    return checkin

@router.post("/calculate", response_model=AICalorieCalculationResponse)
async def calculate_calories(
    data: AICalorieCalculationRequest,
    current_user: User = Depends(get_current_user)
):
    result = await health_ai_service.calculate_daily_log(
        data.breakfast_content,
        data.lunch_content,
        data.dinner_content,
        data.exercise_content
    )
    return AICalorieCalculationResponse(**result)
