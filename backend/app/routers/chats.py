from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from jose import JWTError, jwt
from tortoise.expressions import Q

from app.core.config import settings
from app.core.deps import get_current_user
from app.models.users import User
from app.models.direct_chat import DirectConversation, DirectMessage
from app.schemas.chats import (
    DirectConversationOut,
    ChatUserOut,
    ConversationEnsureIn,
    SendDirectMessageIn,
    DirectMessageOut,
    DirectMessageListOut,
    ConversationLastMessageOut,
)


router = APIRouter()


class ChatConnectionManager:
    def __init__(self):
        self._connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self._connections.setdefault(user_id, []).append(websocket)

    def disconnect(self, user_id: int, websocket: WebSocket):
        if user_id not in self._connections:
            return
        self._connections[user_id] = [ws for ws in self._connections[user_id] if ws is not websocket]
        if not self._connections[user_id]:
            self._connections.pop(user_id, None)

    async def send_to_user(self, user_id: int, payload: Dict[str, Any]):
        sockets = self._connections.get(user_id, [])
        if not sockets:
            return
        dead: List[WebSocket] = []
        for ws in sockets:
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(user_id, ws)


chat_manager = ChatConnectionManager()


async def get_user_from_token(token: str) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await User.get_or_none(username=username)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user


def normalize_user_pair(a: User, b: User):
    if a.id < b.id:
        return a, b
    return b, a


async def ensure_conversation(current_user: User, peer_user: User) -> DirectConversation:
    user_low, user_high = normalize_user_pair(current_user, peer_user)
    conv = await DirectConversation.get_or_none(user_low=user_low, user_high=user_high)
    if conv:
        return conv
    return await DirectConversation.create(user_low=user_low, user_high=user_high)


def conversation_peer(conv: DirectConversation, current_user: User) -> User:
    if conv.user_low_id == current_user.id:
        return conv.user_high
    return conv.user_low


@router.post("/chats/conversations/ensure", response_model=DirectConversationOut)
async def ensure_conversation_endpoint(
    payload: ConversationEnsureIn,
    current_user: User = Depends(get_current_user),
):
    peer = await User.get_or_none(id=payload.peer_user_id)
    if not peer:
        raise HTTPException(status_code=404, detail="User not found")
    if peer.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot chat with yourself")

    conv = await ensure_conversation(current_user, peer)
    await conv.fetch_related("user_low", "user_high")
    peer_user = conversation_peer(conv, current_user)

    last_msg = await DirectMessage.filter(conversation=conv).order_by("-created_at").first()
    unread_count = await DirectMessage.filter(conversation=conv, receiver=current_user, is_read=False).count()

    return DirectConversationOut(
        id=conv.id,
        peer=ChatUserOut.from_orm(peer_user),
        unread_count=unread_count,
        last_message=ConversationLastMessageOut(
            id=last_msg.id,
            sender_id=last_msg.sender_id,
            receiver_id=last_msg.receiver_id,
            message_type=last_msg.message_type,
            text=last_msg.text,
            media_url=last_msg.media_url,
            extra=last_msg.extra or {},
            is_read=last_msg.is_read,
            created_at=last_msg.created_at,
        )
        if last_msg
        else None,
        updated_at=conv.updated_at,
    )


@router.get("/chats/conversations", response_model=List[DirectConversationOut])
async def list_conversations(current_user: User = Depends(get_current_user)):
    convs = (
        await DirectConversation.filter(Q(user_low=current_user) | Q(user_high=current_user))
        .prefetch_related("user_low", "user_high")
        .order_by("-updated_at")
        .all()
    )

    result: List[DirectConversationOut] = []
    for conv in convs:
        peer_user = conversation_peer(conv, current_user)
        last_msg = await DirectMessage.filter(conversation=conv).order_by("-created_at").first()
        unread_count = await DirectMessage.filter(conversation=conv, receiver=current_user, is_read=False).count()

        result.append(
            DirectConversationOut(
                id=conv.id,
                peer=ChatUserOut.from_orm(peer_user),
                unread_count=unread_count,
                last_message=ConversationLastMessageOut(
                    id=last_msg.id,
                    sender_id=last_msg.sender_id,
                    receiver_id=last_msg.receiver_id,
                    message_type=last_msg.message_type,
                    text=last_msg.text,
                    media_url=last_msg.media_url,
                    extra=last_msg.extra or {},
                    is_read=last_msg.is_read,
                    created_at=last_msg.created_at,
                )
                if last_msg
                else None,
                updated_at=conv.updated_at,
            )
        )

    return result


@router.get("/chats/conversations/{conversation_id}/messages", response_model=DirectMessageListOut)
async def list_messages(
    conversation_id: int,
    limit: int = Query(30, ge=1, le=100),
    before_id: Optional[int] = Query(None, ge=1),
    current_user: User = Depends(get_current_user),
):
    conv = await DirectConversation.get_or_none(id=conversation_id).prefetch_related("user_low", "user_high")
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if current_user.id not in (conv.user_low_id, conv.user_high_id):
        raise HTTPException(status_code=403, detail="Forbidden")

    query = DirectMessage.filter(conversation=conv)
    if before_id:
        query = query.filter(id__lt=before_id)
    items = await query.order_by("-id").limit(limit + 1).all()
    has_more = len(items) > limit
    if has_more:
        items = items[:limit]
    items.reverse()

    return DirectMessageListOut(
        items=[
            DirectMessageOut(
                id=m.id,
                conversation_id=conv.id,
                sender_id=m.sender_id,
                receiver_id=m.receiver_id,
                message_type=m.message_type,
                text=m.text,
                media_url=m.media_url,
                extra=m.extra or {},
                is_read=m.is_read,
                read_at=m.read_at,
                created_at=m.created_at,
            )
            for m in items
        ],
        has_more=has_more,
    )


@router.post("/chats/messages", response_model=DirectMessageOut)
async def send_message(payload: SendDirectMessageIn, current_user: User = Depends(get_current_user)):
    peer = await User.get_or_none(id=payload.peer_user_id)
    if not peer:
        raise HTTPException(status_code=404, detail="User not found")
    if peer.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot chat with yourself")

    msg_type = payload.message_type
    if msg_type not in {"text", "image", "voice", "emoji", "sticker"}:
        raise HTTPException(status_code=400, detail="Invalid message_type")
    if msg_type == "text" and not (payload.text and payload.text.strip()):
        raise HTTPException(status_code=400, detail="Text message requires text")
    if msg_type in {"image", "voice", "sticker"} and not payload.media_url:
        raise HTTPException(status_code=400, detail="Media message requires media_url")

    conv = await ensure_conversation(current_user, peer)
    msg = await DirectMessage.create(
        conversation=conv,
        sender=current_user,
        receiver=peer,
        message_type=msg_type,
        text=payload.text,
        media_url=payload.media_url,
        extra=payload.extra or {},
        is_read=False,
        read_at=None,
    )
    await conv.save()

    out = DirectMessageOut(
        id=msg.id,
        conversation_id=conv.id,
        sender_id=msg.sender_id,
        receiver_id=msg.receiver_id,
        message_type=msg.message_type,
        text=msg.text,
        media_url=msg.media_url,
        extra=msg.extra or {},
        is_read=msg.is_read,
        read_at=msg.read_at,
        created_at=msg.created_at,
    )

    payload_to_peer = {
        "type": "new_message",
        "data": out.dict(),
    }
    await chat_manager.send_to_user(peer.id, payload_to_peer)

    return out


@router.post("/chats/conversations/{conversation_id}/read")
async def mark_conversation_read(conversation_id: int, current_user: User = Depends(get_current_user)):
    conv = await DirectConversation.get_or_none(id=conversation_id).prefetch_related("user_low", "user_high")
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if current_user.id not in (conv.user_low_id, conv.user_high_id):
        raise HTTPException(status_code=403, detail="Forbidden")

    now = datetime.now(timezone.utc)
    updated = await DirectMessage.filter(conversation=conv, receiver=current_user, is_read=False).update(
        is_read=True,
        read_at=now,
    )

    peer_user = conversation_peer(conv, current_user)
    await chat_manager.send_to_user(
        peer_user.id,
        {"type": "read", "data": {"conversation_id": conv.id, "reader_id": current_user.id, "updated": updated}},
    )

    return {"updated": updated}


@router.websocket("/chats/ws")
async def chats_ws(websocket: WebSocket, token: str):
    user = await get_user_from_token(token)
    await chat_manager.connect(user.id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        chat_manager.disconnect(user.id, websocket)
    except Exception:
        chat_manager.disconnect(user.id, websocket)

