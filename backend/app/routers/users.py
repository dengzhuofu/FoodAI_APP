from fastapi import APIRouter, Depends, HTTPException, Query
from app.schemas.users import UserOut
from app.schemas.content import CommentOut
from app.models.users import User, Follow
from app.models.recipes import Comment
from app.core.deps import get_current_user
from typing import List, Dict

router = APIRouter()

@router.get("/me", response_model=UserOut)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/me/stats")
async def get_user_stats(current_user: User = Depends(get_current_user)):
    # Import here to avoid circular imports if any
    from app.models.recipes import Recipe
    
    recipes_count = await Recipe.filter(author=current_user).count()
    followers_count = await Follow.filter(following=current_user).count()
    following_count = await Follow.filter(follower=current_user).count()
    
    return {
        "recipes_count": recipes_count,
        "followers_count": followers_count,
        "following_count": following_count
    }

@router.post("/{user_id}/follow")
async def follow_user(
    user_id: int,
    current_user: User = Depends(get_current_user)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
        
    target_user = await User.get_or_none(id=user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Check if already following
    exists = await Follow.filter(follower=current_user, following=target_user).exists()
    if exists:
        return {"message": "Already following"}
        
    await Follow.create(follower=current_user, following=target_user)
    return {"message": "Followed successfully"}

@router.delete("/{user_id}/follow")
async def unfollow_user(
    user_id: int,
    current_user: User = Depends(get_current_user)
):
    target_user = await User.get_or_none(id=user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    deleted_count = await Follow.filter(follower=current_user, following=target_user).delete()
    if not deleted_count:
        return {"message": "Not following"}
        
    return {"message": "Unfollowed successfully"}

@router.get("/{user_id}/followers", response_model=List[UserOut])
async def get_followers(
    user_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    follows = await Follow.filter(following_id=user_id).offset((page - 1) * page_size).limit(page_size).prefetch_related("follower").all()
    return [f.follower for f in follows]

@router.get("/{user_id}/following", response_model=List[UserOut])
async def get_following(
    user_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    follows = await Follow.filter(follower_id=user_id).offset((page - 1) * page_size).limit(page_size).prefetch_related("following").all()
    return [f.following for f in follows]

@router.get("/{user_id}/comments", response_model=List[CommentOut])
async def get_user_comments(
    user_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    comments = await Comment.filter(user_id=user_id).order_by("-created_at").offset((page - 1) * page_size).limit(page_size).prefetch_related("user").all()
    
    # Format for schema
    result = []
    for c in comments:
        result.append({
            "id": c.id,
            "content": c.content,
            "rating": c.rating,
            "user": c.user,
            "parent_id": c.parent_id,
            "created_at": c.created_at,
            "replies": [] # Nested replies not loaded here
        })
    return result
