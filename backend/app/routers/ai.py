from fastapi import APIRouter, UploadFile, File, Form, Depends, Body, HTTPException
from app.services.ai_service import ai_service
from app.models.users import User
from app.core.deps import get_current_user
from app.models.chat import ChatSession, ChatMessage, AgentPreset
from app.models.ai_logs import AILog
from app.schemas.ai import (
    TextToRecipeRequest, 
    TextToImageRequest, 
    ImageToRecipeRequest, 
    ImageToCalorieRequest,
    FridgeToRecipeRequest,
    GenerateRecipeImageRequest,
    RecognizeFridgeRequest,
    GenerateWhatToEatRequest,
    KitchenAgentRequest,
    MealPlanRequest,
    ChatSessionCreate,
    ChatSessionUpdate,
    ChatSessionOut,
    ChatMessageOut,
    AgentPresetCreate,
    AgentPresetUpdate,
    AgentPresetOut
)
from typing import List

router = APIRouter()

# --- Agent Presets Endpoints ---

@router.post("/presets", response_model=AgentPresetOut)
async def create_agent_preset(
    request: AgentPresetCreate,
    current_user: User = Depends(get_current_user)
):
    preset = await AgentPreset.create(
        user=current_user,
        name=request.name,
        description=request.description,
        system_prompt=request.system_prompt,
        allowed_tools=request.allowed_tools
    )
    return preset

@router.put("/presets/{preset_id}", response_model=AgentPresetOut)
async def update_agent_preset(
    preset_id: int,
    request: AgentPresetUpdate,
    current_user: User = Depends(get_current_user)
):
    preset = await AgentPreset.get_or_none(id=preset_id, user=current_user)
    if not preset:
        # Check if system preset
        exists = await AgentPreset.get_or_none(id=preset_id)
        if exists and await exists.user == None:
             raise HTTPException(status_code=403, detail="Cannot edit system preset")
        raise HTTPException(status_code=404, detail="Preset not found")
        
    update_data = request.dict(exclude_unset=True)
    if update_data:
        for key, value in update_data.items():
            setattr(preset, key, value)
        await preset.save()
        
    return preset

@router.get("/presets", response_model=List[AgentPresetOut])
async def get_agent_presets(
    current_user: User = Depends(get_current_user)
):
    # Get user presets
    user_presets = await AgentPreset.filter(user=current_user).all()
    # Get system presets (user is null)
    system_presets = await AgentPreset.filter(user=None).all()
    
    # Mark system presets
    result = []
    for p in system_presets:
        p_dict = dict(p)
        p.is_system = True # Manually set for response
        # Or better, just return list. Pydantic might need a field for is_system
        # Since AgentPresetOut has is_system, we need to ensure it's set.
        # But Tortoise model doesn't have is_system column, it's computed.
        # We can construct Pydantic models manually or let Tortoise model method handle it if we added one.
        # For simplicity:
        result.append(p)
        
    result.extend(user_presets)
    return result

@router.get("/presets/{preset_id}", response_model=AgentPresetOut)
async def get_agent_preset(
    preset_id: int,
    current_user: User = Depends(get_current_user)
):
    preset = await AgentPreset.get_or_none(id=preset_id)
    if not preset:
        raise HTTPException(status_code=404, detail="Preset not found")
    
    # Check access: allow if system preset (user is None) OR belongs to current user
    user_id = await preset.user_id # Access foreign key ID
    if user_id is not None and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    return preset

@router.delete("/presets/{preset_id}")
async def delete_agent_preset(
    preset_id: int,
    current_user: User = Depends(get_current_user)
):
    # Only allow deleting own presets
    deleted_count = await AgentPreset.filter(id=preset_id, user=current_user).delete()
    if deleted_count == 0:
         # Check if it exists but is system
         exists = await AgentPreset.get_or_none(id=preset_id)
         if exists and await exists.user == None:
             raise HTTPException(status_code=403, detail="Cannot delete system preset")
         raise HTTPException(status_code=404, detail="Preset not found")
    return {"message": "Preset deleted"}

@router.get("/agent/tools")
async def get_available_agent_tools(
    current_user: User = Depends(get_current_user)
):
    """Return list of available tools for agents"""
    # This list should match the available_tools_map in ai_service.kitchen_agent_chat
    # Ideally, we should export this from ai_service, but for now we define it here as metadata
    return [
        { "id": 'get_fridge_items', "name": '查看冰箱库存', "description": '获取冰箱内的食材列表' },
        { "id": 'add_shopping_item', "name": '管理购物清单', "description": '添加物品到购物清单' },
        { "id": 'get_shopping_list', "name": '查看购物清单', "description": '获取当前的购物清单' },
        { "id": 'get_user_preferences', "name": '获取用户偏好', "description": '读取用户的口味和过敏源信息' },
    ]

# --- Chat Session Endpoints ---

@router.post("/audio/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    # current_user: User = Depends(get_current_user) # Authentication optional for now, or use if needed
):
    try:
        content = await file.read()
        text = await ai_service.transcribe_audio(content)
        return {"text": text}
    except Exception as e:
        print(f"Transcription error: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sessions", response_model=ChatSessionOut)
async def create_chat_session(
    request: ChatSessionCreate,
    current_user: User = Depends(get_current_user)
):
    session = await ChatSession.create(
        user=current_user,
        title=request.title,
        agent_id=request.agent_id
    )
    return session

@router.get("/sessions", response_model=List[ChatSessionOut])
async def get_chat_sessions(
    current_user: User = Depends(get_current_user)
):
    return await ChatSession.filter(user=current_user).order_by("-updated_at")

@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageOut])
async def get_session_messages(
    session_id: int,
    current_user: User = Depends(get_current_user)
):
    session = await ChatSession.get_or_none(id=session_id, user=current_user)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return await ChatMessage.filter(session=session).order_by("created_at")

@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: int,
    current_user: User = Depends(get_current_user)
):
    deleted_count = await ChatSession.filter(id=session_id, user=current_user).delete()
    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session deleted"}

# --- Agent Chat Endpoint ---

@router.post("/meal-plan")
async def generate_meal_plan(
    request: MealPlanRequest,
    current_user: User = Depends(get_current_user)
):
    result = await ai_service.generate_meal_plan(
        request.dietary_restrictions,
        request.preferences,
        request.headcount,
        request.duration_days,
        request.goal,
        request.notes
    )
    
    # Log to DB
    await AILog.create(
        user=current_user,
        feature="meal-plan",
        input_summary=f"{request.duration_days} days plan for {request.headcount}",
        output_result=result
    )
    
    return result

@router.post("/agent/chat")
async def kitchen_agent_chat(
    request: KitchenAgentRequest,
    current_user: User = Depends(get_current_user)
):
    # Handle session creation/retrieval
    session = None
    if request.session_id:
        session = await ChatSession.get_or_none(id=request.session_id, user=current_user)
        if not session:
             # Fallback or create new? Let's fail if ID provided but not found
             # Or auto create if not found?
             pass 
    
    if not session:
        # Create new session if no ID or not found
        # Use first few words of message as title
        title = request.message[:20] + "..." if len(request.message) > 20 else request.message
        session = await ChatSession.create(
            user=current_user,
            title=title,
            agent_id=request.agent_id or "kitchen_agent"
        )

    # Save User Message
    await ChatMessage.create(
        session=session,
        role="user",
        content=request.message
    )
    
    # Load history from DB instead of frontend request.history if session exists?
    # For now, let's mix: use DB history for context
    # Get last N messages
    db_history = await ChatMessage.filter(session=session).order_by("created_at").limit(20)
    
    # Convert to format expected by AI Service
    history_for_ai = [
        {"role": msg.role, "content": msg.content} 
        for msg in db_history 
        # Exclude the message we just saved to avoid duplication in context if ai_service appends it
        # Actually ai_service.kitchen_agent_chat expects previous history, and appends current message
        # So we should exclude the very last one we just saved?
        # ai_service code: messages = history + [current_message]
        # So yes, exclude the one we just saved.
        if msg.content != request.message or msg.role != "user" # Simplistic check
    ]
    # Better: just query all BEFORE the one we just created? 
    # Or simply pass all previous messages.
    
    # Let's trust ai_service to handle the "current message" separation
    # ai_service.kitchen_agent_chat(..., message, history)
    # history should NOT include the current message.
    
    # Re-fetch history excluding the latest one
    # history_objs = await ChatMessage.filter(session=session).order_by("created_at")
    # history_for_ai = [{"role": m.role, "content": m.content} for m in history_objs[:-1]]
    
    # Actually, let's just use what we have. 
    # If we use DB history, we ignore request.history from frontend (which is good for consistency)
    
    # Get previous messages (excluding the one we just added)
    previous_msgs = await ChatMessage.filter(session=session).order_by("-created_at").offset(1).limit(10)
    # Reverse to chronological
    history_for_ai = [{"role": m.role, "content": m.content} for m in reversed(previous_msgs)]

    response = await ai_service.kitchen_agent_chat(
        user_id=current_user.id, 
        message=request.message, 
        history=history_for_ai,
        agent_id=session.agent_id,
        session_id=session.id
    )
    
    # Save Assistant Message
    await ChatMessage.create(
        session=session,
        role="assistant",
        content=response["answer"],
        thoughts=response.get("thoughts")
    )
    
    # Refresh session from DB to get any updates (like title) made by ai_service
    await session.refresh_from_db()
    
    # --- Auto-Title Generation Logic (Moved to Router) ---
    try:
        # Check if title is generic or default
        # Also check if it's the first few turns (e.g. less than 5 messages) to update title
        # Or if title matches the user's first message (which is the default behavior for new sessions)
        is_default_title = (
            session.title in ["新对话", "New Chat"] or 
            session.title.startswith("新对话") or 
            session.title.startswith("New Chat") or
            len(session.title) < 5 or
            session.title == request.message[:20] + "..." or
            session.title == request.message # If title was set to user message
        )
        
        if is_default_title:
            from langchain_core.messages import HumanMessage
            
            # Generate summary title
            title_prompt = f"""请根据以下对话内容，生成一个简短的标题（不超过10个字），概括用户的意图。
            
            用户: {request.message}
            AI: {response['answer'][:100]}...
            
            只返回标题文字，不要包含引号或其他内容。"""
            
            # Use ai_service's llm directly
            title_response = await ai_service.llm_text.ainvoke([HumanMessage(content=title_prompt)])
            new_title = title_response.content.strip().strip('"').strip("《").strip("》")
            if len(new_title) > 20:
                new_title = new_title[:20]
            
            print(f"DEBUG: Auto-updating title from '{session.title}' to '{new_title}'")
            session.title = new_title
            # We will save this change along with updated_at below
    except Exception as e:
        print(f"Failed to generate title in router: {e}")

    # Update session updated_at and potentially title
    await session.save()
    
    return {
        "response": response,
        "session_id": session.id
    }

@router.get("/history")
async def get_history(
    current_user: User = Depends(get_current_user),
    limit: int = 20,
    offset: int = 0,
    feature: str = None
):
    query = AILog.filter(user=current_user)
    if feature:
        query = query.filter(feature=feature)
    logs = await query.order_by("-created_at").offset(offset).limit(limit)
    return {"history": logs}

@router.post("/recognize-fridge")
async def recognize_fridge(
    request: RecognizeFridgeRequest,
    current_user: User = Depends(get_current_user)
):
    items = await ai_service.recognize_fridge_items(request.image_url)
    
    # Log to DB
    await AILog.create(
        user=current_user,
        feature="recognize-fridge",
        input_summary="Fridge Recognition",
        output_result={"items": items}
    )
    
    return {"items": items}

@router.post("/generate-recipe-image")
async def generate_recipe_image(
    request: GenerateRecipeImageRequest,
    current_user: User = Depends(get_current_user)
):
    import httpx
    import uuid
    from app.services.oss_service import oss_service
    
    # Define a helper to download and upload
    async def process_and_upload(image_url: str, prefix: str = "ai_gen") -> str:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.get(image_url)
                resp.raise_for_status()
                image_bytes = resp.content
                
            filename = f"{prefix}_{uuid.uuid4().hex}.jpg"
            if oss_service.is_configured():
                key = f"uploads/{filename}"
                return await oss_service.upload_bytes(image_bytes, key)
            return image_url
        except Exception as e:
            return image_url

    recipe = request.recipe_data
    
    if request.image_type == 'final':
        # Generate Final Dish Image
        title = recipe.get('title', '')
        description = recipe.get('description', '')
        
        prompt = f"Professional food photography of {title}. {description}. High resolution, 4k, delicious, restaurant quality."
        original_url = await ai_service.generate_image(prompt)
        final_url = await process_and_upload(original_url, "final")
        
        result_data = {"image_url": final_url}
        
        # Log to DB
        await AILog.create(
            user=current_user,
            feature="generate-recipe-image-final",
            input_summary=f"Final Image for {title}",
            output_result=result_data
        )

        # Update source log if exists
        if request.source_log_id:
            try:
                source_log = await AILog.get_or_none(id=request.source_log_id, user=current_user)
                if source_log and source_log.output_result:
                    # Update the image_url in the original recipe result
                    # Ensure output_result is a dict
                    updated_result = source_log.output_result
                    if isinstance(updated_result, str):
                        import json
                        updated_result = json.loads(updated_result)
                    
                    if isinstance(updated_result, dict):
                        updated_result["image_url"] = final_url
                        source_log.output_result = updated_result
                        await source_log.save(update_fields=['output_result'])
                    else:
                        pass
            except Exception as e:
                import traceback
                traceback.print_exc()

        return result_data
        
    elif request.image_type == 'steps':
        # Generate Step Images
        steps_images = []
        title = recipe.get('title', '')
        steps = recipe.get('steps', [])
        
        for index, step_text in enumerate(steps):
            # To save time/cost, maybe limit to first 5 steps or similar? 
            # For now, generate all.
            step_prompt = f"Cooking step {index+1} for {title}: {step_text}. Close up shot, professional food photography, bright lighting."
            try:
                original_url = await ai_service.generate_image(step_prompt)
                step_url = await process_and_upload(original_url, f"step_{index+1}")
                steps_images.append({
                    "step_index": index,
                    "image_url": step_url,
                    "text": step_text
                })
            except Exception as e:
                # Continue even if one fails
                continue
                
        result_data = {"images": steps_images}
        
        # Log to DB
        await AILog.create(
            user=current_user,
            feature="generate-recipe-image-steps",
            input_summary=f"Step Images for {title}",
            output_result=result_data
        )

        # Update source log if exists
        if request.source_log_id:
            try:
                source_log = await AILog.get_or_none(id=request.source_log_id, user=current_user)
                if source_log and source_log.output_result:
                    # Update step images in the original recipe result
                    updated_result = source_log.output_result
                    if isinstance(updated_result, str):
                        import json
                        updated_result = json.loads(updated_result)
                        
                    if isinstance(updated_result, dict):
                        # Maybe store as 'step_images' field
                        updated_result["step_images"] = steps_images
                        source_log.output_result = updated_result
                        await source_log.save(update_fields=['output_result'])
                    else:
                        pass
            except Exception as e:
                import traceback
                traceback.print_exc()

        return result_data
    
    return {"error": "Invalid image type"}

@router.post("/text-to-recipe")
async def text_to_recipe(
    request: TextToRecipeRequest,
    current_user: User = Depends(get_current_user)
):
    result = await ai_service.generate_recipe_from_text(request.description, request.preferences)
    
    # Log to DB
    log = await AILog.create(
        user=current_user,
        feature="text-to-recipe",
        input_summary=request.description[:100],
        output_result=result
    )
    
    return {"result": result, "log_id": log.id}

@router.post("/generate-what-to-eat")
async def generate_what_to_eat(
    request: GenerateWhatToEatRequest,
    current_user: User = Depends(get_current_user)
):
    options = await ai_service.generate_what_to_eat_options(request.categories, request.quantity)
    
    # Log to DB
    await AILog.create(
        user=current_user,
        feature="what-to-eat",
        input_summary=f"Categories: {request.categories}, Qty: {request.quantity}",
        output_result={"options": options}
    )
    
    return {"options": options}

@router.post("/text-to-image")
async def text_to_image(
    request: TextToImageRequest,
    current_user: User = Depends(get_current_user)
):
    url = await ai_service.generate_image(request.prompt)
    
    # Log to DB
    await AILog.create(
        user=current_user,
        feature="text-to-image",
        input_summary=request.prompt,
        output_result={"url": url}
    )
    
    return {"url": url}

@router.post("/image-to-recipe")
async def image_to_recipe(
    request: ImageToRecipeRequest,
    current_user: User = Depends(get_current_user)
):
    # In a real app, user uploads file, backend uploads to storage (S3), gets URL, then calls AI
    # Here we assume frontend sends URL (e.g. from previously uploaded image)
    result = await ai_service.generate_recipe_from_image(request.image_url)
    
    # Log to DB
    log = await AILog.create(
        user=current_user,
        feature="image-to-recipe",
        input_summary="Image Analysis",
        output_result=result
    )
    
    return {"result": result, "log_id": log.id}

@router.post("/image-to-calorie")
async def image_to_calorie(
    request: ImageToCalorieRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        print(f"DEBUG: Processing image-to-calorie request for URL: {request.image_url}")
        result = await ai_service.estimate_calories(request.image_url)
        print("DEBUG: AI Service result received")
        
        # Log to DB
        await AILog.create(
            user=current_user,
            feature="image-to-calorie",
            input_summary="Calorie Estimation",
            output_result=result
        )
        
        return {"result": result}
    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        print(f"ERROR in image-to-calorie: {error_msg}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Internal Error: {str(e)}")

@router.post("/fridge-to-recipe")
async def fridge_to_recipe(
    request: FridgeToRecipeRequest,
    current_user: User = Depends(get_current_user)
):
    result = await ai_service.fridge_to_recipe(request.items)
    
    # Log to DB
    log = await AILog.create(
        user=current_user,
        feature="fridge-to-recipe",
        input_summary=", ".join(request.items)[:100],
        output_result=result
    )
    
    return {"result": result, "log_id": log.id}
