from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.users import UserOut

class NotificationBase(BaseModel):
    type: str
    title: str
    content: str
    target_id: Optional[int] = None
    target_type: Optional[str] = None
    is_read: bool = False

class NotificationCreate(NotificationBase):
    user_id: int
    sender_id: Optional[int] = None

class NotificationOut(NotificationBase):
    id: int
    created_at: datetime
    sender: Optional[UserOut] = None

    class Config:
        from_attributes = True
