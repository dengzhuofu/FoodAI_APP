from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from app.models.notifications import Notification
from app.schemas.notifications import NotificationOut
from app.models.users import User
from app.core.deps import get_current_user
from typing import List, Optional

router = APIRouter()

@router.get("/notifications", response_model=List[NotificationOut])
async def get_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    type: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    query = Notification.filter(user=current_user)
    if type:
        query = query.filter(type=type)
        
    return await query.order_by("-created_at").offset((page - 1) * page_size).limit(page_size).prefetch_related("sender").all()

@router.get("/notifications/unread-count")
async def get_unread_count(current_user: User = Depends(get_current_user)):
    count = await Notification.filter(user=current_user, is_read=False).count()
    return {"count": count}

@router.put("/notifications/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user)
):
    notification = await Notification.get_or_none(id=notification_id, user=current_user)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    await notification.save()
    return {"message": "Marked as read"}

@router.post("/notifications/read-all")
async def mark_all_as_read(current_user: User = Depends(get_current_user)):
    await Notification.filter(user=current_user, is_read=False).update(is_read=True)
    return {"message": "All marked as read"}
