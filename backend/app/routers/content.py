from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form
from typing import List, Optional, Union
import shutil
import uuid
import os
from tortoise.expressions import Q
from app.schemas.content import (
    RecipeCreate, RecipeOut, 
    RestaurantCreate, RestaurantOut,
    CommentCreate, CommentOut
)
from app.models.recipes import Recipe, Comment, Collection, Like, ViewHistory
from app.models.restaurants import Restaurant
from app.models.users import User
from app.core.deps import get_current_user

router = APIRouter()

# --- Recipe Endpoints ---

@router.post("/recipes", response_model=RecipeOut)
async def create_recipe(
    recipe_in: RecipeCreate,
    current_user: User = Depends(get_current_user)
):
    recipe = await Recipe.create(author=current_user, **recipe_in.dict())
    await recipe.fetch_related("author")
    return recipe

@router.get("/recipes", response_model=List[RecipeOut])
async def get_recipes(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    q: Optional[str] = None,
    cuisine: Optional[str] = None,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    cooking_time: Optional[str] = None,
    sort_by: str = "created_at",  # created_at, likes_count, calories
    desc: bool = True
):
    query = Recipe.all()

    # Filters
    if q:
        query = query.filter(Q(title__icontains=q) | Q(description__icontains=q))
    if cuisine:
        query = query.filter(cuisine=cuisine)
    if category:
        query = query.filter(category=category)
    if difficulty:
        query = query.filter(difficulty=difficulty)
    if cooking_time:
        query = query.filter(cooking_time=cooking_time)
        
    # Sorting
    if desc:
        query = query.order_by(f"-{sort_by}")
    else:
        query = query.order_by(sort_by)
        
    # Pagination
    return await query.offset((page - 1) * page_size).limit(page_size).prefetch_related("author")

@router.get("/recipes/{recipe_id}", response_model=RecipeOut)
async def get_recipe_detail(
    recipe_id: int,
    current_user: User = Depends(get_current_user)
):
    recipe = await Recipe.get_or_none(id=recipe_id).prefetch_related("author")
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
        
    # Check if liked and collected
    is_liked = await Like.filter(
        user=current_user, target_id=recipe_id, target_type='recipe'
    ).exists()
    
    is_collected = await Collection.filter(
        user=current_user, target_id=recipe_id, target_type='recipe'
    ).exists()
    
    # Manually attach these fields (Pydantic schema will need update or return dict)
    # Since we use response_model, we might need to update the schema or return a dict that matches
    # Let's update the return to include these extra fields if the schema supports it, 
    # OR for now, just return the recipe object and let frontend handle it if we modify schema.
    # To avoid schema validation error, let's update schema first.
    # But for quick fix without changing global schema, we can return a dict and update frontend to expect it?
    # No, better update schema.
    
    # Actually, we can attach them to the recipe object dynamically
    recipe.is_liked = is_liked
    recipe.is_collected = is_collected
    
    return recipe

# --- Restaurant Endpoints ---

@router.post("/restaurants", response_model=RestaurantOut)
async def create_restaurant(
    restaurant_in: RestaurantCreate,
    current_user: User = Depends(get_current_user)
):
    restaurant = await Restaurant.create(author=current_user, **restaurant_in.dict())
    await restaurant.fetch_related("author")
    return restaurant

@router.get("/restaurants", response_model=List[RestaurantOut])
async def get_restaurants(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    q: Optional[str] = None,
    cuisine: Optional[str] = None,
    rating_min: Optional[float] = None,
    sort_by: str = "created_at",
    desc: bool = True
):
    query = Restaurant.all()
    
    # Filters
    if q:
        query = query.filter(Q(name__icontains=q) | Q(title__icontains=q))
    if cuisine:
        query = query.filter(cuisine=cuisine)
    if rating_min:
        query = query.filter(rating__gte=rating_min)
        
    # Sorting
    if desc:
        query = query.order_by(f"-{sort_by}")
    else:
        query = query.order_by(sort_by)
        
    return await query.offset((page - 1) * page_size).limit(page_size).prefetch_related("author")

@router.get("/restaurants/{restaurant_id}", response_model=RestaurantOut)
async def get_restaurant_detail(
    restaurant_id: int,
    current_user: User = Depends(get_current_user)
):
    restaurant = await Restaurant.get_or_none(id=restaurant_id).prefetch_related("author")
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
        
    is_liked = await Like.filter(
        user=current_user, target_id=restaurant_id, target_type='restaurant'
    ).exists()
    
    is_collected = await Collection.filter(
        user=current_user, target_id=restaurant_id, target_type='restaurant'
    ).exists()
    
    restaurant.is_liked = is_liked
    restaurant.is_collected = is_collected
    
    return restaurant

# --- Comment Endpoints ---

@router.post("/comments", response_model=CommentOut)
async def create_comment(
    content: Optional[str] = Form(None),
    target_id: int = Form(...),
    target_type: str = Form(...),
    parent_id: Optional[int] = Form(None),
    rating: Optional[int] = Form(None),
    images: List[UploadFile] = File(None),
    current_user: User = Depends(get_current_user)
):
    if not content and not images:
        raise HTTPException(status_code=400, detail="Comment must have content or images")

    if target_type == 'recipe':
        if not await Recipe.filter(id=target_id).exists():
             raise HTTPException(status_code=404, detail="Recipe not found")
    elif target_type == 'restaurant':
        if not await Restaurant.filter(id=target_id).exists():
             raise HTTPException(status_code=404, detail="Restaurant not found")
             
    # Verify parent comment exists if provided
    level = 0
    root_parent_id = None
    
    if parent_id:
        parent = await Comment.get_or_none(id=parent_id)
        if not parent:
            raise HTTPException(status_code=404, detail="Parent comment not found")
        level = parent.level + 1
        # If parent is level 0, then root is parent.id
        # If parent is level > 0, then root is parent.root_parent_id
        root_parent_id = parent.root_parent_id if parent.level > 0 else parent.id
    
    # Handle Image Uploads
    image_urls = []
    if images:
        upload_dir = "backend/static/uploads"
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)
            
        for image in images:
            filename = image.filename or "image.jpg"
            ext = filename.split(".")[-1] if "." in filename else "jpg"
            save_filename = f"{uuid.uuid4()}.{ext}"
            file_path = os.path.join(upload_dir, save_filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            # Store relative path
            image_urls.append(f"/static/uploads/{save_filename}")

    comment = await Comment.create(
        user=current_user, 
        content=content or "",
        target_id=target_id,
        target_type=target_type,
        parent_id=parent_id,
        rating=rating,
        images=image_urls,
        level=level,
        root_parent_id=root_parent_id
    )
    await comment.fetch_related("user")
    
    return {
        "id": comment.id,
        "content": comment.content,
        "rating": comment.rating,
        "user": comment.user,
        "parent_id": comment.parent_id,
        "level": comment.level,
        "root_parent_id": comment.root_parent_id,
        "created_at": comment.created_at,
        "images": comment.images,
        "replies": []
    }

@router.get("/comments", response_model=List[CommentOut])
async def get_comments(
    target_id: int,
    target_type: str,
    page: int = 1,
    page_size: int = 20
):
    # Fetch top-level comments
    main_comments = await Comment.filter(
        target_id=target_id, 
        target_type=target_type,
        parent_id__isnull=True
    ).offset((page - 1) * page_size).limit(page_size).order_by("-created_at").prefetch_related("user").all()
    
    result = []
    
    # Fetch replies for these comments
    for comment in main_comments:
        # Fetch all descendants (where root_parent_id == comment.id)
        descendants = await Comment.filter(root_parent_id=comment.id).order_by("created_at").prefetch_related("user").all()
        
        replies_list = []
        for r in descendants:
            replies_list.append({
                "id": r.id,
                "content": r.content,
                "rating": r.rating,
                "user": r.user,
                "parent_id": r.parent_id,
                "level": r.level,
                "root_parent_id": r.root_parent_id,
                "created_at": r.created_at,
                "images": r.images,
                "replies": []
            })
            
        result.append({
            "id": comment.id,
            "content": comment.content,
            "rating": comment.rating,
            "user": comment.user,
            "parent_id": comment.parent_id,
            "level": comment.level,
            "root_parent_id": comment.root_parent_id,
            "created_at": comment.created_at,
            "images": comment.images,
            "replies": replies_list
        })
        
    return result

# --- Collection Endpoints ---

@router.get("/collections", response_model=Union[List[RecipeOut], List[RestaurantOut]])
async def get_collections(
    target_type: str = Query(..., pattern="^(recipe|restaurant)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    # Get collected IDs
    collections = await Collection.filter(
        user=current_user, 
        target_type=target_type
    ).offset((page - 1) * page_size).limit(page_size).all()
    
    target_ids = [c.target_id for c in collections]
    
    if not target_ids:
        return []
        
    if target_type == 'recipe':
        # Use filter(id__in=...)
        items = await Recipe.filter(id__in=target_ids).prefetch_related("author").all()
        return items
    else:
        items = await Restaurant.filter(id__in=target_ids).prefetch_related("author").all()
        return items

@router.post("/collections")
async def toggle_collection(
    target_id: int,
    target_type: str,
    current_user: User = Depends(get_current_user)
):
    exists = await Collection.filter(
        user=current_user, target_id=target_id, target_type=target_type
    ).exists()
    
    if exists:
        await Collection.filter(
            user=current_user, target_id=target_id, target_type=target_type
        ).delete()
        return {"message": "Uncollected"}
    else:
        await Collection.create(
            user=current_user, target_id=target_id, target_type=target_type
        )
        return {"message": "Collected"}

# --- Like Endpoints ---

@router.post("/likes")
async def toggle_like(
    target_id: int,
    target_type: str,
    current_user: User = Depends(get_current_user)
):
    exists = await Like.filter(
        user=current_user, target_id=target_id, target_type=target_type
    ).exists()
    
    if exists:
        await Like.filter(
            user=current_user, target_id=target_id, target_type=target_type
        ).delete()
        
        # Decrement counter
        if target_type == 'recipe':
            recipe = await Recipe.get_or_none(id=target_id)
            if recipe and recipe.likes_count > 0:
                recipe.likes_count -= 1
                await recipe.save()
        
        return {"message": "Unliked"}
    else:
        await Like.create(
            user=current_user, target_id=target_id, target_type=target_type
        )
        
        # Increment counter
        if target_type == 'recipe':
            recipe = await Recipe.get_or_none(id=target_id)
            if recipe:
                recipe.likes_count += 1
                await recipe.save()
        
        return {"message": "Liked"}

# --- View History Endpoints ---

@router.post("/views")
async def record_view(
    target_id: int,
    target_type: str,
    current_user: User = Depends(get_current_user)
):
    # Update or create view history
    view, created = await ViewHistory.get_or_create(
        user=current_user, target_id=target_id, target_type=target_type,
        defaults={"target_id": target_id, "target_type": target_type}
    )
    
    if not created:
        await view.save() # Updates updated_at
    
    # Increment view counter on target
    if target_type == 'recipe':
        recipe = await Recipe.get_or_none(id=target_id)
        if recipe:
            recipe.views_count += 1
            await recipe.save()
            
    return {"message": "View recorded"}
