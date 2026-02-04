from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TextToRecipeRequest(BaseModel):
    description: str
    preferences: Optional[str] = ""

class TextToImageRequest(BaseModel):
    prompt: str

class ImageToRecipeRequest(BaseModel):
    image_url: str

class ImageToCalorieRequest(BaseModel):
    image_url: str

class FridgeToRecipeRequest(BaseModel):
    items: List[str]

class RecognizeFridgeRequest(BaseModel):
    image_url: str

class GenerateRecipeImageRequest(BaseModel):
    recipe_data: dict
    image_type: str = "final"  # final or steps
    source_log_id: Optional[int] = None

class GenerateWhatToEatRequest(BaseModel):
    categories: List[str]
    quantity: int

class MealPlanRequest(BaseModel):
    dietary_restrictions: Optional[str] = None # 忌口
    preferences: Optional[str] = None # 口味/喜好
    notes: Optional[str] = None # 额外备注
    headcount: int = 1 # 用餐人数
    duration_days: int = 7 # 周期（天）
    goal: Optional[str] = None # 目标（减脂/增肌/维持）

class KitchenAgentRequest(BaseModel):
    message: str
    history: List[dict] = []
    session_id: Optional[int] = None
    agent_id: Optional[str] = "kitchen_agent"

class ChatSessionCreate(BaseModel):
    title: Optional[str] = "新对话"
    agent_id: str = "kitchen_agent"

class ChatSessionUpdate(BaseModel):
    title: str

class ChatSessionOut(BaseModel):
    id: int
    title: str
    agent_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ChatMessageOut(BaseModel):
    id: int
    role: str
    content: str
    thoughts: Optional[List[dict]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class AgentPresetCreate(BaseModel):
    name: str
    description: Optional[str] = None
    system_prompt: str
    allowed_tools: List[str] = []

class AgentPresetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    allowed_tools: Optional[List[str]] = None

class AgentPresetOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    system_prompt: str
    allowed_tools: List[str] = []
    is_system: bool = False
    
    class Config:
        from_attributes = True
