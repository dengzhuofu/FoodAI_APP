from fastapi import APIRouter, UploadFile, File, Form, Depends, Body
from app.services.ai_service import ai_service
from app.models.users import User
from app.core.deps import get_current_user
from app.models.ai_logs import AILog
from app.schemas.ai import (
    TextToRecipeRequest, 
    TextToImageRequest, 
    ImageToRecipeRequest, 
    ImageToCalorieRequest,
    FridgeToRecipeRequest,
    GenerateRecipeImageRequest
)

router = APIRouter()

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

@router.post("/generate-recipe-image")
async def generate_recipe_image(
    request: GenerateRecipeImageRequest,
    current_user: User = Depends(get_current_user)
):
    import httpx
    import uuid
    from app.services.cos_service import cos_service
    
    # Define a helper to download and upload
    async def process_and_upload(image_url: str, prefix: str = "ai_gen") -> str:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.get(image_url)
                resp.raise_for_status()
                image_bytes = resp.content
                
            filename = f"{prefix}_{uuid.uuid4().hex}.jpg"
            # If COS is configured, upload to COS
            if cos_service.is_configured():
                return await cos_service.upload_bytes(image_bytes, filename)
            else:
                # Fallback to just returning the original URL if COS not ready (or handle local save)
                # For now, just return original to ensure it works
                return image_url
        except Exception as e:
            print(f"Error processing image upload: {e}")
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
                        print(f"Successfully updated log {request.source_log_id} with image_url")
                    else:
                        print(f"Cannot update log {request.source_log_id}: output_result is not a dict")
            except Exception as e:
                print(f"Failed to update source log: {e}")
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
                print(f"Failed to generate image for step {index}: {e}")
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
                        print(f"Successfully updated log {request.source_log_id} with step_images")
                    else:
                        print(f"Cannot update log {request.source_log_id}: output_result is not a dict")
            except Exception as e:
                print(f"Failed to update source log: {e}")
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
