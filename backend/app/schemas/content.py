from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
from app.schemas.users import UserOut

class CommentBase(BaseModel):
    content: Optional[str] = ""
    rating: Optional[int] = None
    images: List[str] = []

class CommentCreate(CommentBase):
    target_id: int
    target_type: str  # 'recipe' or 'restaurant'
    parent_id: Optional[int] = None  # Added for replies

class CommentOut(CommentBase):
    id: int
    user: UserOut
    parent_id: Optional[int] = None
    level: int = 0
    root_parent_id: Optional[int] = None
    created_at: datetime
    replies: List['CommentOut'] = []  # Added for nested replies
    
    class Config:
        from_attributes = True

# Resolve forward reference
CommentOut.model_rebuild()

class RecipeBase(BaseModel):
    title: str
    cover_image: str
    images: List[str] = []
    description: Optional[str] = None
    cooking_time: Optional[str] = None
    difficulty: Optional[str] = None
    cuisine: Optional[str] = None
    category: Optional[str] = None
    tags: List[str] = []
    calories: Optional[int] = None
    nutrition: Optional[Dict] = None
    ingredients: List[Dict[str, str]] = []  # List of {name: str, amount: str}
    steps: List[Dict[str, str]] = []        # List of {description: str, image: Optional[str]}

class RecipeCreate(RecipeBase):
    pass

class RecipeOut(RecipeBase):
    id: int
    author: UserOut
    likes_count: int
    views_count: int = 0
    is_liked: bool = False
    is_collected: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True

class RestaurantBase(BaseModel):
    name: str
    title: str
    content: Optional[str] = None
    images: List[str] = []
    address: Optional[str] = None
    rating: Optional[float] = None
    cuisine: Optional[str] = None
    category: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    hours: Optional[str] = None
    phone: Optional[str] = None

class RestaurantCreate(RestaurantBase):
    pass

class RestaurantOut(RestaurantBase):
    id: int
    author: UserOut
    likes_count: int
    views_count: int = 0
    is_liked: bool = False
    is_collected: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True
