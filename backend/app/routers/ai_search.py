from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
import json
import os
from backend.app.services.vector_service import VectorService
from backend.app.models.recipes import Recipe
from pydantic import BaseModel
from backend.app.agents.planner_graph import run_planner

router = APIRouter()

# 实例化 VectorService
vector_service = VectorService()

@router.post("/sync-index")
async def sync_index():
    """
    同步所有食谱和烹饪知识到向量索引。
    1. 获取所有食谱 (标题 + 描述 + 食材 + 标签)
    2. 加载 backend/data/cooking_knowledge.json
    3. 使用 VectorService 索引它们
    """
    try:
        # 1. 获取所有食谱
        recipes = await Recipe.all()
        
        recipe_texts = []
        recipe_metadatas = []
        
        for recipe in recipes:
            # 构建文本表示：标题 + 描述 + 食材 + 标签
            # 确保 ingredients 和 tags 是字符串列表，如果不确定类型，先转换为字符串
            ingredients_list = recipe.ingredients if isinstance(recipe.ingredients, list) else []
            tags_list = recipe.tags if isinstance(recipe.tags, list) else []
            
            ingredients_str = " ".join([str(i) for i in ingredients_list])
            tags_str = " ".join([str(t) for t in tags_list])
            
            description = recipe.description or ""
            
            # 组合文本用于向量化
            text = f"{recipe.title} {description} {ingredients_str} {tags_str}"
            recipe_texts.append(text)
            
            # 准备元数据
            recipe_metadatas.append({
                "id": recipe.id,
                "type": "recipe",
                "title": recipe.title,
                "description": description,
                "cover_image": recipe.cover_image,
                "category": recipe.category,
                "difficulty": recipe.difficulty,
                "cooking_time": recipe.cooking_time
            })
            
        # 2. 加载烹饪知识
        # 计算 backend/data/cooking_knowledge.json 的路径
        # 假设当前文件在 backend/app/routers/ai_search.py
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        knowledge_path = os.path.join(base_dir, "data", "cooking_knowledge.json")
        
        knowledge_texts = []
        knowledge_metadatas = []
        
        if os.path.exists(knowledge_path):
            try:
                with open(knowledge_path, 'r', encoding='utf-8') as f:
                    knowledge_data = json.load(f)
                    
                for item in knowledge_data:
                    title = item.get('title', '')
                    content = item.get('content', '')
                    category = item.get('category', '')
                    
                    text = f"{title} {content} {category}"
                    knowledge_texts.append(text)
                    
                    knowledge_metadatas.append({
                        "type": "knowledge",
                        "category": category,
                        "title": title,
                        "content": content
                    })
            except Exception as e:
                print(f"Error loading cooking knowledge: {e}")
        else:
            print(f"Warning: Cooking knowledge file not found at {knowledge_path}")
        
        # 3. 索引数据
        all_texts = recipe_texts + knowledge_texts
        all_metadatas = recipe_metadatas + knowledge_metadatas
        
        if all_texts:
            # 为了全量同步，我们重建索引
            # 注意：_create_new_index 是内部方法，但我们需要重置索引
            vector_service._create_new_index() 
            vector_service.add_documents(all_texts, all_metadatas)
            vector_service.save_index()
            
        return {
            "message": "Index synced successfully",
            "stats": {
                "total_indexed": len(all_texts),
                "recipes": len(recipe_texts),
                "knowledge": len(knowledge_texts)
            }
        }
            
    except Exception as e:
        print(f"Error in sync_index: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class PlanEventRequest(BaseModel):
    request: str

@router.post("/plan-event")
async def plan_event(body: PlanEventRequest):
    """
    Plan an event based on user request.
    Calls run_planner(request) from app.agents.planner_graph.
    Returns the final state (menu, shopping list, schedule).
    """
    try:
        result = await run_planner(body.request)
        return result
    except Exception as e:
        print(f"Error in plan_event: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search/semantic")
async def semantic_search(
    q: str = Query(..., description="搜索查询文本"),
    type: Optional[str] = Query(None, enum=["recipe", "knowledge", "all"], description="搜索类型过滤")
):
    """
    语义搜索接口
    - Query param: q (string)
    - Query param: type (optional: recipe, knowledge, all)
    """
    try:
        filter_type = type
        if type == "all":
            filter_type = None
            
        # 调用 VectorService.similarity_search
        results = vector_service.similarity_search(q, k=10, filter_type=filter_type)
        return results
    except Exception as e:
        print(f"Error in semantic_search: {e}")
        raise HTTPException(status_code=500, detail=str(e))
