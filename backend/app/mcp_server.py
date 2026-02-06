# coding=utf-8
from mcp.server.fastmcp import FastMCP
from typing import List, Optional
import asyncio
from tortoise.expressions import Q
# Remove explicit service imports if they don't exist or use direct DB access
from app.models.users import User
from app.models.inventory import FridgeItem
from app.models.recipes import Recipe
from app.core.config import settings
import datetime
import os

# 初始化 FastMCP 服务器
# 我们创建一个名为 "AI Kitchen" 的 MCP 服务器
mcp = FastMCP("AI Kitchen")

# 获取默认用户 ID (从环境变量动态获取的辅助函数)
def get_current_user_id() -> int:
    return int(os.environ.get("MCP_USER_ID", "1"))

# --- 工具定义 ---

@mcp.tool()
async def list_fridge_items(user_id: int = 0) -> str:
    """
    列出用户冰箱中的当前所有食材。
    
    Args:
        user_id: 用户的 ID (如果不传或为0，则使用当前上下文的用户 ID)。
        
    Returns:
        以 Markdown 列表格式返回的食材清单。
    """
    # 动态处理默认值
    if user_id == 0:
        user_id = get_current_user_id()

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
async def add_fridge_item(name: str, quantity: str = "1", category: str = "其他", user_id: int = 0) -> str:
    """
    向冰箱中添加一种食材。
    
    Args:
        name: 食材名称 (如 "鸡蛋").
        quantity: 数量描述 (如 "12个", "500g").
        category: 分类 (如 "蔬菜", "肉类", "其他").
        user_id: 用户 ID (如果不传或为0，则使用当前上下文的用户 ID)。
        
    Returns:
        操作结果消息。
    """
    # 动态处理默认值
    if user_id == 0:
        user_id = get_current_user_id()
        
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

@mcp.tool()
async def search_recipes(keyword: str) -> str:
    """
    根据关键词搜索菜谱。
    
    Args:
        keyword: 搜索关键词 (如 "鸡肉", "川菜").
        
    Returns:
        Markdown 格式的推荐菜谱列表。
    """
    try:
        # 模糊搜索标题或描述
        recipes = await Recipe.filter(
            Q(title__icontains=keyword) | Q(description__icontains=keyword)
        ).limit(5).all()
        
        if not recipes:
            return f"没有找到关于“{keyword}”的菜谱。"
            
        response = f"### 🍳 “{keyword}” 搜索结果\n\n"
        for recipe in recipes:
            title = recipe.title
            desc = recipe.description or '暂无描述'
            time = recipe.cooking_time or '未知'
            # diff = recipe.difficulty or '未知'
            
            response += f"#### {title}\n"
            response += f"- ⏱️ 耗时: {time}\n"
            response += f"- 📝 简介: {desc}\n\n"
            
        return response
    except Exception as e:
        return f"搜索菜谱时出错: {str(e)}"

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
