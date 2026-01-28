from fastapi import APIRouter, Depends, HTTPException, Query
from app.models.users import User, ShoppingItem
from app.core.deps import get_current_user
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class ShoppingItemCreate(BaseModel):
    name: str
    amount: Optional[str] = None

class ShoppingItemOut(BaseModel):
    id: int
    name: str
    amount: Optional[str]
    is_checked: bool
    created_at: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ShoppingItemOut])
async def get_shopping_list(current_user: User = Depends(get_current_user)):
    items = await ShoppingItem.filter(user=current_user).order_by("-created_at").all()
    # Convert datetime to string
    return [
        ShoppingItemOut(
            id=i.id, 
            name=i.name, 
            amount=i.amount, 
            is_checked=i.is_checked, 
            created_at=i.created_at.isoformat()
        ) for i in items
    ]

@router.post("/", response_model=List[ShoppingItemOut])
async def add_to_shopping_list(
    items: List[ShoppingItemCreate],
    current_user: User = Depends(get_current_user)
):
    # Bulk create
    new_items = []
    for item in items:
        # Check if exists to avoid duplicates (optional, but good UX)
        exists = await ShoppingItem.filter(user=current_user, name=item.name).first()
        if not exists:
            new_item = await ShoppingItem.create(
                user=current_user,
                name=item.name,
                amount=item.amount
            )
            new_items.append(new_item)
    
    # Return current full list
    all_items = await ShoppingItem.filter(user=current_user).order_by("-created_at").all()
    return [
        ShoppingItemOut(
            id=i.id, 
            name=i.name, 
            amount=i.amount, 
            is_checked=i.is_checked, 
            created_at=i.created_at.isoformat()
        ) for i in all_items
    ]

@router.patch("/{item_id}/toggle", response_model=ShoppingItemOut)
async def toggle_item(
    item_id: int,
    current_user: User = Depends(get_current_user)
):
    item = await ShoppingItem.filter(id=item_id, user=current_user).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item.is_checked = not item.is_checked
    await item.save()
    
    return ShoppingItemOut(
        id=item.id, 
        name=item.name, 
        amount=item.amount, 
        is_checked=item.is_checked, 
        created_at=item.created_at.isoformat()
    )

@router.delete("/{item_id}")
async def delete_item(
    item_id: int,
    current_user: User = Depends(get_current_user)
):
    deleted_count = await ShoppingItem.filter(id=item_id, user=current_user).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Deleted successfully"}
