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
