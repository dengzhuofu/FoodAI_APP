import asyncio
from mcp.client.sse import sse_client
from mcp.client.session import ClientSession

async def main():
    url = "https://mcp.amap.com/sse?key=29e7caed46bac237d51a63efac632f42"
    async with sse_client(url) as streams:
        async with ClientSession(streams[0], streams[1]) as session:
            await session.initialize()
            tools = await session.list_tools()
            for tool in tools.tools:
                if "direction" in tool.name or "route" in tool.name:
                    print(f"Tool: {tool.name}")
                    print(f"Description: {tool.description}")
                    print("-" * 20)

if __name__ == "__main__":
    asyncio.run(main())
