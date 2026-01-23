from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class FridgeItemBase(BaseModel):
    name: str
    category: Optional[str] = None
    quantity: Optional[str] = None
    icon: Optional[str] = None
    expiry_date: Optional[date] = None

class FridgeItemCreate(FridgeItemBase):
    pass

class FridgeItemOut(FridgeItemBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ShoppingItemBase(BaseModel):
    name: str
    category: Optional[str] = None
    is_bought: bool = False

class ShoppingItemCreate(ShoppingItemBase):
    pass

class ShoppingItemOut(ShoppingItemBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True
