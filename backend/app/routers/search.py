from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from app.core.deps import get_current_user
from app.models import User, SearchHistory, Recipe, Restaurant
from pydantic import BaseModel

router = APIRouter()

class SearchHistoryOut(BaseModel):
    keyword: str
    last_searched_at: str

@router.get("/history", response_model=List[str])
async def get_search_history(user: User = Depends(get_current_user)):
    """获取用户搜索历史（最近10条）"""
    history = await SearchHistory.filter(user=user).order_by("-last_searched_at").limit(10).values_list("keyword", flat=True)
    return history

@router.post("/history")
async def add_search_history(keyword: str = Query(..., min_length=1), user: User = Depends(get_current_user)):
    """添加搜索历史"""
    keyword = keyword.strip()
    if not keyword:
        return {"status": "ignored"}
    
    # 使用 get_or_create
    obj, created = await SearchHistory.get_or_create(
        user=user, 
        keyword=keyword,
        defaults={"count": 1}
    )
    if not created:
        obj.count += 1
        await obj.save()
    return {"status": "ok"}

@router.delete("/history")
async def clear_search_history(user: User = Depends(get_current_user)):
    """清空搜索历史"""
    await SearchHistory.filter(user=user).delete()
    return {"status": "ok"}

@router.get("/hot", response_model=List[str])
async def get_hot_search():
    """获取热搜词"""
    # 简单实现：获取所有记录中计数最高的词
    # 更好的实现需要 group by，这里先简单取一些然后 python 处理
    raw_hot = await SearchHistory.all().order_by("-count").limit(100).values("keyword", "count")
    
    stats = {}
    for item in raw_hot:
        k = item['keyword']
        stats[k] = stats.get(k, 0) + item['count']
    
    sorted_keywords = sorted(stats.items(), key=lambda x: x[1], reverse=True)[:10]
    return [k for k, v in sorted_keywords]

@router.get("/suggest", response_model=List[str])
async def search_suggest(q: str):
    """搜索建议（模糊匹配）"""
    if not q:
        return []
    
    # 搜索食谱标题
    recipes = await Recipe.filter(title__icontains=q).limit(5).values_list("title", flat=True)
    # 搜索餐厅名称
    restaurants = await Restaurant.filter(name__icontains=q).limit(5).values_list("name", flat=True)
    
    # 合并去重
    results = list(set(list(recipes) + list(restaurants)))
    return results[:10]
