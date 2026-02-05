from fastapi import APIRouter, Depends, HTTPException
from app.models.users import User
from app.core.deps import get_current_user
from app.services.mcdonalds_service import mcdonalds_service
from app.schemas.mcdonalds import TokenRequest, ToolCallRequest, ChatRequest
from app.services.ai_service import ai_service
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langchain_core.tools import StructuredTool
from langchain_openai import ChatOpenAI
from app.core.config import settings
import json

router = APIRouter()

@router.post("/token")
async def save_token(
    request: TokenRequest,
    current_user: User = Depends(get_current_user)
):
    await mcdonalds_service.save_token(current_user, request.token)
    return {"message": "Token saved successfully"}

@router.get("/token")
async def get_token_status(
    current_user: User = Depends(get_current_user)
):
    token = await mcdonalds_service.get_token(current_user)
    if token:
        masked = token[:4] + "*" * (len(token) - 8) + token[-4:] if len(token) > 8 else "****"
        return {"has_token": True, "masked_token": masked}
    return {"has_token": False}

@router.get("/tools")
async def list_tools(
    current_user: User = Depends(get_current_user)
):
    try:
        tools = await mcdonalds_service.list_tools(current_user)
        return {"tools": tools}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/call")
async def call_tool(
    request: ToolCallRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        result = await mcdonalds_service.call_tool(current_user, request.tool_name, request.arguments)
        return {"result": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def chat_with_mcp(
    request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    # 1. Check token
    token = await mcdonalds_service.get_token(current_user)
    if not token:
        raise HTTPException(status_code=400, detail="Please set your McDonald's token first.")

    # 2. Get available tools from MCP
    try:
        mcp_tools = await mcdonalds_service.list_tools(current_user)
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Failed to list MCP tools: {e}")

    # 3. Create OpenAI-compatible tool definitions from MCP tools
    openai_tools = []
    
    for tool_def in mcp_tools:
        openai_tools.append({
            "type": "function",
            "function": {
                "name": tool_def["name"],
                "description": tool_def.get("description", ""),
                "parameters": tool_def["input_schema"]
            }
        })

    # 4. Initialize LLM
    llm = ChatOpenAI(
        api_key=settings.SILICONFLOW_API_KEY,
        base_url=settings.SILICONFLOW_BASE_URL,
        model="Qwen/Qwen2.5-7B-Instruct",
        temperature=0.1
    )
    
    # Bind tools directly using the OpenAI format
    # Note: bind_tools accepts a list of tool definitions
    llm_with_tools = llm.bind_tools(openai_tools)

    # 5. Run LLM
    messages = [
        SystemMessage(content="""You are a McDonald's assistant. You can help users check activities, coupons, and claim coupons using the available tools. 
If you provide image URLs, please use Markdown format: ![image description](url) so they can be rendered.
IMPORTANT: When calling tools, ensure you follow the schema strictly. If a tool does not require arguments, pass an empty object.
If a tool execution fails, politely inform the user and show the error message.
 If the tool returns Markdown content (e.g. calendars, coupons), please output it directly so the user can see it.
 If the tool returns image URLs, please strictly use the standard Markdown image syntax: ![description](url) so the frontend can render them."""),
        HumanMessage(content=request.message)
    ]
    
    response = await llm_with_tools.ainvoke(messages)
    
    tool_calls = response.tool_calls
    results = []
    
    if tool_calls:
        messages.append(response)
        for tool_call in tool_calls:
            # Execute tool
            tool_name = tool_call["name"]
            tool_args = tool_call["args"]
            
            # Find the tool func
            # Since we wrapped it, we call the service directly
            try:
                tool_result = await mcdonalds_service.call_tool(current_user, tool_name, tool_args)
                results.append({"tool": tool_name, "result": tool_result})
                
                # Ensure tool_result is a string for the LLM
                content_str = tool_result if isinstance(tool_result, str) else json.dumps(tool_result, ensure_ascii=False)
                
                messages.append(ToolMessage(
                    tool_call_id=tool_call["id"],
                    content=content_str
                ))
            except Exception as e:
                results.append({"tool": tool_name, "error": str(e)})
                messages.append(ToolMessage(
                    tool_call_id=tool_call["id"],
                    content=f"Error: {str(e)}"
                ))
        
        # Get final response from LLM
        final_response = await llm_with_tools.ainvoke(messages)
        return {
            "response": final_response.content,
            "tool_calls": results
        }
    
    return {
        "response": response.content,
        "tool_calls": []
    }
