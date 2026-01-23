from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from app.schemas.content import RecipeOut, RestaurantOut
from app.models.recipes import Recipe
from app.models.restaurants import Restaurant
import random

router = APIRouter()

@router.get("/recommendations")
async def get_recommendations(
    page: int = 1,
    limit: int = 10,
    type: Optional[str] = None,  # recipe, restaurant, or all
    sort_by: Optional[str] = "default",  # default, time, likes, views
    category: Optional[str] = None
):
    """
    Get personalized recommendations with sorting and filtering.
    """
    items = []
    offset = (page - 1) * limit
    
    # Determine sorting field
    order_field = "-likes_count" # default
    if sort_by == "time":
        order_field = "-created_at"
    elif sort_by == "likes":
        order_field = "-likes_count"
    elif sort_by == "views":
        order_field = "-views_count"
    
    if type in [None, "recipe"]:
        query = Recipe.all()
        if category and category != "全部":
            query = query.filter(category=category)
            
        recipes = await query.order_by(order_field).offset(offset).limit(limit).prefetch_related("author")
        for r in recipes:
            items.append({
                "id": r.id,
                "type": "recipe",
                "title": r.title,
                "image": r.cover_image,
                "author": r.author.nickname if r.author else "Unknown",
                "likes": r.likes_count,
                "views": r.views_count,
                "category": r.category,
                "created_at": r.created_at.isoformat(),
                "recommendation_reason": "Popular Choice"
            })

    if type in [None, "restaurant"]:
        query = Restaurant.all()
        if category and category != "全部":
            query = query.filter(category=category)
            
        # Restaurant might not have views_count populated yet, use default logic if field missing in some old records?
        # Since we added default=0, it should be fine.
        
        # Note: If sorting by rating for restaurants, we might need special handling, 
        # but here we unify with likes/views/time.
        if sort_by == "default":
             restaurants = await query.order_by("-rating").offset(offset).limit(limit).prefetch_related("author")
        else:
             restaurants = await query.order_by(order_field).offset(offset).limit(limit).prefetch_related("author")

        for r in restaurants:
            items.append({
                "id": r.id,
                "type": "restaurant",
                "title": r.title,
                "image": r.images[0] if r.images else "",
                "author": r.author.nickname if r.author else "Unknown",
                "likes": r.likes_count,
                "views": r.views_count,
                "category": r.category,
                "created_at": r.created_at.isoformat(),
                "rating": r.rating,
                "recommendation_reason": "Top Rated"
            })
    
    if type is None:
        # Simple merge and sort if mixed (this is approximation for pagination)
        # In a real system, we'd use a unified index (e.g. Elasticsearch)
        random.shuffle(items)
        items = items[:limit]
        
    return items

@router.get("/health-diet", response_model=List[RecipeOut])
async def get_health_diet(
    max_calories: Optional[int] = Query(None, description="Maximum calories per serving"),
    min_protein: Optional[int] = Query(None, description="Minimum protein in grams"),
    low_fat: bool = Query(False, description="Filter for low fat recipes"),
    page: int = 1,
    page_size: int = 10
):
    """
    Filter recipes based on nutritional values.
    """
    query = Recipe.all()
    
    if max_calories:
        query = query.filter(calories__lte=max_calories)
        
    # Note: Complex JSON filtering depends on DB support. 
    # For now, we fetch and filter in python if needed, or assume simple fields if schema allows.
    # Since 'nutrition' is a JSONField, standard SQL filtering is limited without specific DB extensions.
    # We will filter by calories primarily as it is a separate field.
    
    # If we had separate columns for protein/fat, we could filter directly.
    # For now, let's return the calorie-filtered list.
    
    return await query.order_by("calories").offset((page - 1) * page_size).limit(page_size).prefetch_related("author")

@router.get("/health-news")
async def get_health_news():
    """
    Get health news and tips.
    Mock data for now.
    """
    return [
        {
            "id": 1,
            "title": "2024年最受欢迎的健康饮食趋势",
            "summary": "探索低碳水、间歇性断食等热门饮食法。",
            "image": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500",
            "date": "2024-01-15"
        },
        {
            "id": 2,
            "title": "如何科学补充蛋白质",
            "summary": "蛋白质摄入不仅仅是吃肉，植物蛋白同样重要。",
            "image": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500",
            "date": "2024-01-10"
        },
        {
            "id": 3,
            "title": "冬季养生食谱推荐",
            "summary": "温暖身心的滋补汤品，增强免疫力。",
            "image": "https://images.unsplash.com/photo-1547592166-23acbe3a624b?w=500",
            "date": "2024-01-05"
        }
    ]

@router.get("/tags")
async def get_popular_tags():
    """
    Get popular search tags / categories.
    """
    return ["减脂", "快手菜", "早餐", "下午茶", "低卡", "增肌", "便当", "烘焙", "素食", "川菜"]

@router.get("/search")
async def search(
    q: str,
    type: Optional[str] = None
):
    results = {}
    
    if type in [None, "recipe"]:
        recipes = await Recipe.filter(title__icontains=q).prefetch_related("author").limit(5)
        results["recipes"] = recipes

    if type in [None, "restaurant"]:
        restaurants = await Restaurant.filter(name__icontains=q).prefetch_related("author").limit(5)
        results["restaurants"] = restaurants
        
    return results
