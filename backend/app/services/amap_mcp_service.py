import os
import json
import asyncio
from typing import List, Dict, Any, Optional
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage, AIMessage
from mcp.client.sse import sse_client
from mcp.client.session import ClientSession
from app.core.config import settings

class AmapMCPService:
    def __init__(self):
        self.base_url = settings.SILICONFLOW_BASE_URL
        self.api_key = settings.SILICONFLOW_API_KEY
        # Use the key provided by the user
        self.amap_mcp_url = "https://mcp.amap.com/sse?key=29e7caed46bac237d51a63efac632f42"
        
        self.llm = ChatOpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
            model="Qwen/Qwen3-8B", # Use a stronger model for tool calling if possible, or Qwen/Qwen3-8B
            temperature=0.7,
            max_tokens=2048,
        )

    async def chat(self, message: str, history: List[Dict[str, Any]], session_id: int = None) -> Dict[str, Any]:
        print(f"Connecting to MCP: {self.amap_mcp_url}")
        
        try:
            async with sse_client(self.amap_mcp_url) as streams:
                async with ClientSession(streams[0], streams[1]) as session:
                    await session.initialize()
                    
                    # List tools
                    try:
                        mcp_tools = await session.list_tools()
                    except Exception as e:
                        print(f"Error listing tools: {e}")
                        return {"answer": "无法获取地图工具列表。", "thoughts": []}
                    
                    # Convert MCP tools to OpenAI tool format
                    openai_tools = []
                    
                    for tool in mcp_tools.tools:
                        openai_tools.append({
                            "type": "function",
                            "function": {
                                "name": tool.name,
                                "description": tool.description,
                                "parameters": tool.inputSchema
                            }
                        })
                    
                    # Bind tools to LLM
                    if openai_tools:
                        llm_with_tools = self.llm.bind_tools(openai_tools)
                    else:
                        llm_with_tools = self.llm
                    
                    # Construct Messages
                    system_content = "你是高德地图智能助手。你可以使用工具来查询地点、规划路线、查询天气等。请根据用户的需求调用相应的工具。请用中文回答。"
                    system_content += "\n\n当用户询问路线时，如果提供了当前位置（User's current location），请将其作为起点（origin）。如果提供了目标位置（Target destination），请将其作为终点（destination）。注意坐标格式为 'lng,lat'。"
                    
                    messages = [
                        SystemMessage(content=system_content)
                    ]
                    
                    for msg in history:
                        if msg["role"] == "user":
                            messages.append(HumanMessage(content=msg["content"]))
                        elif msg["role"] == "assistant":
                            messages.append(AIMessage(content=msg["content"]))
                            
                    messages.append(HumanMessage(content=message))
                    
                    thoughts = []
                    MAX_TURNS = 8
                    turn_count = 0
                    final_answer = ""
                    
                    while turn_count < MAX_TURNS:
                        turn_count += 1
                        print(f"Turn {turn_count}...")
                        try:
                            response = await llm_with_tools.ainvoke(messages)
                        except Exception as e:
                            print(f"LLM Error: {e}")
                            return {"answer": "AI服务暂时不可用。", "thoughts": thoughts}

                        messages.append(response)
                        
                        if not response.tool_calls:
                            final_answer = response.content
                            break
                        
                        for tool_call in response.tool_calls:
                            fn_name = tool_call["name"]
                            args = tool_call["args"]
                            
                            print(f"Calling tool: {fn_name} with args: {args}")
                            thoughts.append({
                                "tool": fn_name,
                                "args": args,
                                "description": f"调用工具: {fn_name}..."
                            })
                            
                            try:
                                # Call MCP tool
                                result = await session.call_tool(fn_name, arguments=args)
                                
                                # MCP returns CallToolResult, we need the content
                                content_str = ""
                                raw_data = None
                                
                                if hasattr(result, 'content'):
                                    for c in result.content:
                                        if c.type == 'text':
                                            content_str += c.text
                                            # Try to parse JSON if it looks like one, for frontend rendering
                                            try:
                                                if c.text.strip().startswith('{') or c.text.strip().startswith('['):
                                                    import json
                                                    raw_data = json.loads(c.text)
                                            except:
                                                pass
                                        elif c.type == 'image':
                                            content_str += "[Image]"
                                else:
                                    content_str = str(result)
                                
                                # Limit content length to avoid context overflow if too large
                                if len(content_str) > 2000:
                                    content_str_truncated = content_str[:2000] + "...(truncated)"
                                else:
                                    content_str_truncated = content_str
                                    
                                print(f"Tool result: {content_str[:100]}...")
                                messages.append(ToolMessage(tool_call_id=tool_call["id"], content=content_str_truncated))
                                
                                # Store raw data for frontend
                                thoughts[-1]["result_data"] = {
                                    "tool": fn_name,
                                    "data": raw_data if raw_data else content_str
                                }
                                
                            except Exception as e:
                                error_msg = f"Error calling {fn_name}: {str(e)}"
                                print(error_msg)
                                messages.append(ToolMessage(tool_call_id=tool_call["id"], content=error_msg))
                    
                    if not final_answer:
                         # Force summary
                         final_answer = response.content or "已完成操作。"

                    # Extract tool results for frontend rendering
                    tool_results = []
                    for thought in thoughts:
                         # We might want to store the actual result in thoughts or a separate list
                         # Currently thoughts has description. We need the data.
                         pass
                    
                    # We need to capture tool outputs in the loop. 
                    # Let's modify the loop to store raw results.

                    return {
                        "answer": final_answer,
                        "thoughts": thoughts,
                        "tool_results": [t.get("result_data") for t in thoughts if t.get("result_data")]
                    }

        except Exception as e:
            print(f"MCP Chat Error: {e}")
            import traceback
            traceback.print_exc()
            return {
                "answer": f"抱歉，连接地图服务时出现错误: {str(e)}",
                "thoughts": []
            }

amap_service = AmapMCPService()
