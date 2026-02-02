from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime


class ChatUserOut(BaseModel):
    id: int
    username: str
    nickname: str
    avatar: Optional[str] = None

    class Config:
        from_attributes = True


class DirectMessageOut(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    receiver_id: int
    message_type: str
    text: Optional[str] = None
    media_url: Optional[str] = None
    extra: Dict[str, Any] = {}
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationLastMessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    message_type: str
    text: Optional[str] = None
    media_url: Optional[str] = None
    extra: Dict[str, Any] = {}
    is_read: bool
    created_at: datetime


class DirectConversationOut(BaseModel):
    id: int
    peer: ChatUserOut
    unread_count: int
    last_message: Optional[ConversationLastMessageOut] = None
    updated_at: datetime


class ConversationEnsureIn(BaseModel):
    peer_user_id: int


class SendDirectMessageIn(BaseModel):
    peer_user_id: int
    message_type: str
    text: Optional[str] = None
    media_url: Optional[str] = None
    extra: Dict[str, Any] = {}


class DirectMessageListOut(BaseModel):
    items: List[DirectMessageOut]
    has_more: bool

