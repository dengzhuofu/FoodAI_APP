# coding=utf-8
from mcp.server.fastmcp import FastMCP
from typing import List, Optional
import asyncio
from tortoise.expressions import Q
# Remove explicit service imports if they don't exist or use direct DB access
from app.models.users import User
from app.agents.planner_graph import run_planner
from app.models.inventory import FridgeItem
from app.models.recipes import Recipe
from app.core.config import settings
import datetime
import os

# 初始化 FastMCP 服务器
# 我们创建一个名为 "AI Kitchen" 的 MCP 服务器
mcp = FastMCP("AI Kitchen")

# 获取默认用户 ID (从环境变量)
DEFAULT_USER_ID = int(os.environ.get("MCP_USER_ID", "1"))

# --- 工具定义 ---

@mcp.tool()
async def list_fridge_items(user_id: int = DEFAULT_USER_ID) -> str:
    """
    列出用户冰箱中的当前所有食材。
    
    Args:
        user_id: 用户的 ID (默认为环境变量配置的 ID)。
        
    Returns:
        以 Markdown 列表格式返回的食材清单。
    """
    try:
        # 直接查询数据库
        items = await FridgeItem.filter(user_id=user_id).all()
        
        if not items:
            return "冰箱里现在空空如也。"
            
        # 格式化输出
        response = "### 🧊 冰箱库存清单\n\n"
        for item in items:
            name = item.name or '未知食材'
            quantity = item.quantity or ''
            # icon = item.icon or '' 
            expiry = item.expiry_date.strftime('%Y-%m-%d') if item.expiry_date else '无'
            
            # 组合描述
            desc = f"{quantity}" if quantity else ""
            
            response += f"- **{name}**: {desc} (过期时间: {expiry})\n"
            
        return response
    except Exception as e:
        return f"获取冰箱数据时发生错误: {str(e)}"

@mcp.tool()
async def add_fridge_item(name: str, quantity: str = "1", category: str = "其他", user_id: int = DEFAULT_USER_ID) -> str:
    """
    向冰箱中添加一种食材。
    
    Args:
        name: 食材名称 (如 "鸡蛋").
        quantity: 数量描述 (如 "12个", "500g").
        category: 分类 (如 "蔬菜", "肉类", "其他").
        user_id: 用户 ID (默认为环境变量配置的 ID)。
        
    Returns:
        操作结果消息。
    """
    user = await User.get_or_none(id=user_id)
    if not user:
        return f"错误：找不到 ID 为 {user_id} 的用户。"

    try:
        # 创建新的食材记录
        # 默认设置过期时间为 7 天后 (模拟逻辑)
        expiry = datetime.date.today() + datetime.timedelta(days=7)
        
        await FridgeItem.create(
            user=user,
            name=name,
            quantity=quantity,
            category=category,
            expiry_date=expiry,
            icon="🥬" # 默认图标
        )
        return f"✅ 已成功将 {quantity} {name} 放入冰箱。"
    except Exception as e:
        return f"添加食材失败: {str(e)}"

from app.services.vector_service import VectorService

vector_service = VectorService()

@mcp.tool()
async def retrieve_cooking_knowledge(query: str) -> str:
    """
    Search for cooking tips, techniques, and nutritional facts from the knowledge base.
    Use this to answer general cooking questions or get advice on ingredients.
    """
    try:
        results = vector_service.similarity_search(query, k=3, filter_type="knowledge")
        if not results:
            return "No specific cooking knowledge found for this query."
        
        response = "Here are some relevant cooking tips:\n"
        for res in results:
            response += f"- **{res['metadata'].get('title', 'Tip')}**: {res['page_content']}\n"
        return response
    except Exception as e:
        return f"Error retrieving knowledge: {str(e)}"

@mcp.tool()
async def search_recipes(keyword: str) -> str:
    """
    Search for recipes using semantic search (RAG).
    Finds recipes based on meaning, ingredients, or description, not just exact keywords.
    
    Args:
        keyword: Search query (e.g., "healthy dinner for kids", "spicy chicken").
        
    Returns:
        Markdown formatted list of recommended recipes.
    """
    try:
        # Use semantic search
        results = vector_service.similarity_search(keyword, k=5, filter_type="recipe")
        
        if not results:
            return f"No recipes found matching '{keyword}'."
            
        response = f"### 🍳 Recipes for '{keyword}'\n\n"
        for res in results:
            title = res['metadata'].get('title', 'Unknown Recipe')
            # Fetch full recipe details if needed, but metadata might be enough for now
            # For this tool, we'll return the title and the snippet used for embedding
            snippet = res['page_content'][:200] + "..." if len(res['page_content']) > 200 else res['page_content']
            
            response += f"#### {title}\n"
            response += f"- {snippet}\n\n"
            
        return response
    except Exception as e:
        return f"Error searching recipes: {str(e)}"

@mcp.tool()
async def plan_event(request: str) -> str:
    """
    Plan a meal or event based on user request.
    Generates a menu, checks inventory, creates a shopping list, and a schedule.
    
    Args:
        request: The user's request (e.g., "Plan a birthday party for 4 people").
        
    Returns:
        A formatted markdown string of the plan.
    """
    try:
        # Call the planner agent
        result = await run_planner(request)
        
        # Format the output as Markdown
        response = f"### 📅 Plan for: {request}\n\n"
        
        # Menu Section
        response += "#### 🍽️ Menu\n"
        selected_recipes = result.get('selected_recipes', [])
        if selected_recipes:
            for recipe in selected_recipes:
                # Handle both dict (from search) and object if it was converted
                if isinstance(recipe, dict):
                    title = recipe.get('title', recipe.get('name', 'Unknown Recipe'))
                else:
                    title = getattr(recipe, 'title', 'Unknown Recipe')
                    
                response += f"- **{title}**\n"
        else:
            response += "No recipes selected.\n"
        response += "\n"
        
        # Shopping List Section
        response += "#### 🛒 Shopping List\n"
        shopping_list = result.get('shopping_list', [])
        if shopping_list:
            for item in shopping_list:
                response += f"- {item}\n"
        else:
            response += "No items needed to buy.\n"
        response += "\n"
        
        # Schedule Section
        response += "#### ⏰ Schedule\n"
        schedule = result.get('schedule', 'No schedule generated.')
        response += f"{schedule}\n"
        
        return response
    except Exception as e:
        return f"Error generating plan: {str(e)}"

# --- 启动逻辑 ---

def run_stdio():
    """以 Stdio 模式运行 (适用于 Claude Desktop 等本地客户端)"""
    mcp.run(transport='stdio')

def run_sse():
    """以 SSE 模式运行 (适用于远程调用，如我们的 App)"""
    # FastMCP 目前主要封装了 Stdio，SSE 需要使用 mcp.server.sse 模块手动搭建
    # 这里我们暂时保留入口，后续可以在 FastAPI 中挂载
    pass

if __name__ == "__main__":
    # 默认作为脚本运行时使用 stdio，方便测试
    print("正在启动 AI Kitchen MCP Server (Stdio Mode)...")
    run_stdio()
