from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.schemas.inventory import FridgeItemCreate, FridgeItemOut, ShoppingItemCreate, ShoppingItemOut
from app.models.inventory import FridgeItem, ShoppingItem
from app.models.users import User
from app.core.deps import get_current_user

router = APIRouter()

# Fridge Endpoints
@router.get("/fridge", response_model=List[FridgeItemOut])
async def get_fridge_items(current_user: User = Depends(get_current_user)):
    return await FridgeItem.filter(user=current_user).all()

@router.post("/fridge", response_model=FridgeItemOut)
async def create_fridge_item(
    item_in: FridgeItemCreate,
    current_user: User = Depends(get_current_user)
):
    return await FridgeItem.create(user=current_user, **item_in.dict())

@router.put("/fridge/{item_id}", response_model=FridgeItemOut)
async def update_fridge_item(
    item_id: int,
    item_in: FridgeItemCreate,
    current_user: User = Depends(get_current_user)
):
    item = await FridgeItem.get_or_none(id=item_id, user=current_user)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item.update_from_dict(item_in.dict())
    await item.save()
    return item

@router.delete("/fridge/{item_id}")
async def delete_fridge_item(
    item_id: int,
    current_user: User = Depends(get_current_user)
):
    deleted_count = await FridgeItem.filter(id=item_id, user=current_user).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted"}

# Shopping List Endpoints
@router.get("/shopping-list", response_model=List[ShoppingItemOut])
async def get_shopping_list(current_user: User = Depends(get_current_user)):
    return await ShoppingItem.filter(user=current_user).all()

@router.post("/shopping-list", response_model=ShoppingItemOut)
async def create_shopping_item(
    item_in: ShoppingItemCreate,
    current_user: User = Depends(get_current_user)
):
    return await ShoppingItem.create(user=current_user, **item_in.dict())

@router.post("/shopping-list/batch", response_model=List[ShoppingItemOut])
async def create_shopping_items_batch(
    items_in: List[ShoppingItemCreate],
    current_user: User = Depends(get_current_user)
):
    created_items = []
    for item_in in items_in:
        item = await ShoppingItem.create(user=current_user, **item_in.dict())
        created_items.append(item)
    return created_items

@router.put("/shopping-list/{item_id}", response_model=ShoppingItemOut)
async def update_shopping_item(
    item_id: int,
    item_in: ShoppingItemCreate,
    current_user: User = Depends(get_current_user)
):
    item = await ShoppingItem.get_or_none(id=item_id, user=current_user)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item.update_from_dict(item_in.dict())
    await item.save()
    return item

@router.delete("/shopping-list/{item_id}")
async def delete_shopping_item(
    item_id: int,
    current_user: User = Depends(get_current_user)
):
    deleted_count = await ShoppingItem.filter(id=item_id, user=current_user).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted"}
