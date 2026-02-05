from typing import List, Dict, Any, Optional
from app.models.users import User, UserIntegration
from tortoise.exceptions import DoesNotExist
from mcp import ClientSession
from mcp.client.sse import sse_client
import mcp.types as types

class McDonaldsService:
    # Default URL from user config, but can be overridden if stored in DB or env
    DEFAULT_URL = "https://mcp.mcd.cn"

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

    async def _get_headers(self, token: str) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {token}",
            "User-Agent": "FoodAI-Backend/1.0"
        }

    async def list_tools(self, user: User) -> List[Dict[str, Any]]:
        token = await self.get_token(user)
        if not token:
            raise ValueError("Token not found. Please configure your McDonald's token.")

        headers = await self._get_headers(token)
        
        # Connect to the MCP server
        # We use the connect-query-disconnect pattern for simplicity
        try:
            async with sse_client(self.DEFAULT_URL, headers=headers) as streams:
                async with ClientSession(streams[0], streams[1]) as session:
                    await session.initialize()
                    
                    # List tools
                    result = await session.list_tools()
                    
                    # Convert MCP tool objects to dicts
                    tools_data = []
                    for tool in result.tools:
                        tools_data.append({
                            "name": tool.name,
                            "description": tool.description,
                            "input_schema": tool.inputSchema
                        })
                    
                    return tools_data
        except Exception as e:
            print(f"Error listing tools from MCP: {e}")
            # Fallback to mock if connection fails (optional, but good for testing if URL is invalid)
            # For now, let's re-raise or return a descriptive error so the user knows it failed
            raise ValueError(f"Failed to connect to McDonald's MCP service: {str(e)}")

    async def call_tool(self, user: User, tool_name: str, arguments: Dict[str, Any]) -> Any:
        token = await self.get_token(user)
        if not token:
            raise ValueError("Token not found")

        headers = await self._get_headers(token)

        try:
            async with sse_client(self.DEFAULT_URL, headers=headers) as streams:
                async with ClientSession(streams[0], streams[1]) as session:
                    await session.initialize()
                    
                    # Call tool
                    result = await session.call_tool(tool_name, arguments)
                    
                    # Result is likely a CallToolResult object
                    # We need to parse the content
                    output = []
                    if hasattr(result, 'content'):
                        for content in result.content:
                            if content.type == 'text':
                                output.append(content.text)
                            elif content.type == 'image':
                                output.append(f"[Image: {content.data}]")
                            elif content.type == 'resource':
                                output.append(f"[Resource: {content.resource.uri}]")
                    
                    return "\n".join(output) if output else "No output"
                    
        except Exception as e:
            print(f"Error calling tool {tool_name}: {e}")
            raise ValueError(f"Failed to execute tool: {str(e)}")

mcdonalds_service = McDonaldsService()
