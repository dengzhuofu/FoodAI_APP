from fastapi import APIRouter, Depends, HTTPException
from app.schemas.profile import ProfileUpdate, ProfileOut
from app.models.users import User, UserProfile
from app.core.deps import get_current_user

router = APIRouter()

@router.get("/profile", response_model=ProfileOut)
async def get_profile(current_user: User = Depends(get_current_user)):
    profile = await UserProfile.get_or_none(user=current_user)
    if not profile:
        profile = await UserProfile.create(user=current_user)
    return profile

@router.put("/profile", response_model=ProfileOut)
async def update_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user)
):
    profile = await UserProfile.get_or_none(user=current_user)
    if not profile:
        profile = await UserProfile.create(user=current_user)
    
    profile.preferences = profile_in.preferences
    profile.allergies = profile_in.allergies
    profile.health_goals = profile_in.health_goals
    profile.settings = profile_in.settings
    await profile.save()
    return profile
