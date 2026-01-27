from pydantic import BaseModel
from typing import Optional, List

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

class KitchenAgentRequest(BaseModel):
    message: str
    history: List[dict] = []
