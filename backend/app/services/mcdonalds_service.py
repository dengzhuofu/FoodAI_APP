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
            client_ctx = streamable_http_client(self.url, headers=headers)
        else:
            # Fallback to SSE if streamable http is not available
            client_ctx = sse_client(self.url, headers=headers)

        # Enter the transport context
        read, write = await self.stack.enter_async_context(client_ctx)
        
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
                    output.append(content.text)
                elif content.type == 'image':
                    output.append(f"[Image: {content.data}]")
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
