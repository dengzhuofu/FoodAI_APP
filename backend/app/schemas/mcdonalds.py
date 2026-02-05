from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class TokenRequest(BaseModel):
    token: str

class ToolCallRequest(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]

class ChatRequest(BaseModel):
    message: str
