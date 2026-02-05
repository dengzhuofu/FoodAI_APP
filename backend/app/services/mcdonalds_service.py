from typing import List, Dict, Any, Optional
from app.models.users import User, UserIntegration
from tortoise.exceptions import DoesNotExist
from mcp import ClientSession
from mcp.client.sse import sse_client
# Attempt to import streamable_http_client, fallback to sse if not available or different version
try:
    from mcp.client.streamable_http import streamable_http_client
except ImportError:
    streamable_http_client = None

from contextlib import AsyncExitStack
import mcp.types as types
import asyncio
import httpx
import json
import pandas as pd
from io import StringIO

class MCPClientWrapper:
    """
    Wrapper around MCP ClientSession to manage persistent connection.
    """
    def __init__(self, url: str, token: str):
        self.url = url
        self.token = token
        self.stack = AsyncExitStack()
        self.session: Optional[ClientSession] = None
        self._lock = asyncio.Lock()

    async def connect(self):
        headers = {
            "Authorization": f"Bearer {self.token}",
            "User-Agent": "FoodAI-Backend/1.0"
        }
        
        # Use streamable_http_client if available and requested (based on URL hint or default)
        # The user requested StreamableHTTPClientTransport which maps to streamable_http_client in this SDK
        if streamable_http_client:
            # streamable_http_client does NOT accept headers directly, it accepts an http_client.
            # We must create an httpx client with the headers and manage its lifecycle.
            http_client = await self.stack.enter_async_context(httpx.AsyncClient(headers=headers, timeout=60.0))
            client_ctx = streamable_http_client(self.url, http_client=http_client)
        else:
            # Fallback to SSE if streamable http is not available
            # sse_client accepts headers directly
            client_ctx = sse_client(self.url, headers=headers)

        # Enter the transport context
        # streamable_http_client yields (read, write, get_session_id)
        # sse_client yields (read, write)
        res = await self.stack.enter_async_context(client_ctx)
        
        # Handle unpacking based on result length
        if isinstance(res, tuple) and len(res) == 3:
            read, write, _ = res
        elif isinstance(res, tuple) and len(res) == 2:
            read, write = res
        else:
            # Unexpected, try to unpack as 2
            read, write = res
        
        # Enter the session context
        self.session = await self.stack.enter_async_context(
            ClientSession(read, write)
        )
        
        # Initialize
        await self.session.initialize()
        print(f"MCP Client connected to {self.url}")

    async def ensure_connected(self):
        async with self._lock:
            if not self.session:
                await self.connect()
            # We could add logic to check if session is closed and reconnect

    async def list_tools(self) -> List[Dict[str, Any]]:
        await self.ensure_connected()
        if not self.session:
            raise RuntimeError("Failed to connect to MCP server")
            
        result = await self.session.list_tools()
        
        tools_data = []
        for tool in result.tools:
            tools_data.append({
                "name": tool.name,
                "description": tool.description,
                "input_schema": tool.inputSchema
            })
        return tools_data

    def _format_nutrition_data(self, json_str: str) -> str:
        """
        Format raw JSON nutrition data into a readable Markdown table.
        """
        try:
            # Try to parse the string as JSON
            data = json.loads(json_str)
            
            # If it's a list of dictionaries, we can format it as a table
            if isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
                # Define readable column names map (optional, can be expanded)
                col_map = {
                    "productName": "产品名称",
                    "nutritionDescription": "描述",
                    "energyKj": "能量(KJ)",
                    "energyKcal": "能量(Kcal)",
                    "protein": "蛋白质(g)",
                    "fat": "脂肪(g)",
                    "carbohydrate": "碳水(g)",
                    "sodium": "钠(mg)",
                    "calcium": "钙(mg)"
                }
                
                # Filter/Order columns if needed, or use all
                # For now, let's just rename keys if they match
                df = pd.DataFrame(data)
                df = df.rename(columns=col_map)
                
                # Select only columns that are present in our map to keep it clean, 
                # or keep all but renamed. Let's keep known columns for better readability.
                known_cols = [c for c in col_map.values() if c in df.columns]
                if known_cols:
                    df = df[known_cols]
                
                return df.to_markdown(index=False)
            
            return json_str # Return original if not a list of dicts
        except Exception as e:
            # If parsing fails, just return original string
            return json_str

    async def call_tool(self, name: str, args: Dict[str, Any]) -> Any:
        await self.ensure_connected()
        if not self.session:
            raise RuntimeError("Failed to connect to MCP server")

        result = await self.session.call_tool(name, args)
        
        # Transform result to simple structure
        output = []
        if hasattr(result, 'content'):
            for content in result.content:
                if content.type == 'text':
                    text_content = content.text
                    # Special handling for list-nutrition-foods to format as table
                    if name == 'list-nutrition-foods':
                         text_content = self._format_nutrition_data(text_content)
                    output.append(text_content)
                elif content.type == 'image':
                    # Try to get mime type or default to jpeg
                    mime = getattr(content, 'mimeType', 'image/jpeg')
                    # If data is bytes, encode to base64 string
                    data_str = content.data
                    if isinstance(data_str, bytes):
                        import base64
                        data_str = base64.b64encode(data_str).decode('utf-8')
                    output.append(f"![image](data:{mime};base64,{data_str})")
                elif content.type == 'resource':
                    output.append(f"[Resource: {content.resource.uri}]")
        
        # Return structured data if possible, or text
        # Frontend might expect a specific structure. 
        # If it's just one text block, return string.
        # If multiple, return list or joined string.
        # The user said "MCP 返回结构 ≠ 你前端想要的结构", implying I should fix it.
        # Returning a simple string or a dict with 'result' key is usually safe.
        
        # If the result is JSON-like text, we could try to parse it, but for now return raw text or object
        return "\n".join(output) if output else "No output"

    async def close(self):
        await self.stack.aclose()
        self.session = None

class McDonaldsService:
    # Updated URL as requested
    DEFAULT_URL = "https://mcp.mcd.cn/mcp-servers/mcd-mcp"
    
    def __init__(self):
        # Store clients per user_id
        self.clients: Dict[int, MCPClientWrapper] = {}

    async def get_token(self, user: User) -> Optional[str]:
        try:
            integration = await UserIntegration.get(user=user)
            return integration.mcdonalds_token
        except DoesNotExist:
            return None

    async def save_token(self, user: User, token: str) -> None:
        integration, created = await UserIntegration.get_or_create(user=user)
        integration.mcdonalds_token = token
        await integration.save()
        
        # Force reconnection on token update
        if user.id in self.clients:
            await self.clients[user.id].close()
            del self.clients[user.id]

    async def _get_client(self, user: User) -> MCPClientWrapper:
        if user.id in self.clients:
            return self.clients[user.id]
            
        token = await self.get_token(user)
        if not token:
            raise ValueError("Token not found. Please configure your McDonald's token.")
            
        client = MCPClientWrapper(self.DEFAULT_URL, token)
        self.clients[user.id] = client
        return client

    async def list_tools(self, user: User) -> List[Dict[str, Any]]:
        try:
            client = await self._get_client(user)
            return await client.list_tools()
        except Exception as e:
            print(f"Error listing tools: {e}")
            # If error, maybe remove client to force reconnect next time
            if user.id in self.clients:
                await self.clients[user.id].close()
                del self.clients[user.id]
            raise ValueError(f"Failed to list tools: {str(e)}")

    async def call_tool(self, user: User, tool_name: str, arguments: Dict[str, Any]) -> Any:
        try:
            client = await self._get_client(user)
            return await client.call_tool(tool_name, arguments)
        except Exception as e:
            print(f"Error calling tool {tool_name}: {e}")
            if user.id in self.clients:
                await self.clients[user.id].close()
                del self.clients[user.id]
            raise ValueError(f"Failed to execute tool: {str(e)}")

mcdonalds_service = McDonaldsService()
