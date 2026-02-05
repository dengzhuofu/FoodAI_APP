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

    # 3. Create LangChain tools
    langchain_tools = []
    
    # Helper to create a dynamic tool function
    def create_tool_func(tool_name):
        async def func(**kwargs):
            # This function will be called by the LLM
            return await mcdonalds_service.call_tool(current_user, tool_name, kwargs)
        return func

    for tool_def in mcp_tools:
        name = tool_def["name"]
        description = tool_def.get("description", "")
        # We need to convert JSON schema to Pydantic or just let LangChain handle it if we use StructuredTool.from_function
        # But for simplicity in this dynamic setup, we might need a workaround or simple tool definition.
        # Since we are using bind_tools with ChatOpenAI, we can pass the JSON schema directly if we format it right,
        # or use StructuredTool.
        
        # Simplified: We define a tool that takes any args, validation happens at MCP level (or mock level)
        t = StructuredTool.from_function(
            func=None,
            coroutine=create_tool_func(name),
            name=name,
            description=description,
            # args_schema=... # skipping schema validation here for brevity, trusting LLM to follow description
        )
        langchain_tools.append(t)

    # 4. Initialize LLM
    llm = ChatOpenAI(
        api_key=settings.SILICONFLOW_API_KEY,
        base_url=settings.SILICONFLOW_BASE_URL,
        model="Qwen/Qwen2.5-7B-Instruct", # Or whatever model is used
        temperature=0.1
    )
    
    # Bind tools
    llm_with_tools = llm.bind_tools(langchain_tools)

    # 5. Run LLM
    messages = [
        SystemMessage(content="You are a McDonald's assistant. You can help users check activities, coupons, and claim coupons using the available tools."),
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
                
                messages.append(ToolMessage(
                    tool_call_id=tool_call["id"],
                    content=json.dumps(tool_result)
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
