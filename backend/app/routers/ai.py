from fastapi import APIRouter, UploadFile, File, Form, Depends, Body
from app.services.ai_service import ai_service
from app.models.users import User
from app.core.deps import get_current_user
from app.schemas.ai import (
    TextToRecipeRequest, 
    TextToImageRequest, 
    ImageToRecipeRequest, 
    ImageToCalorieRequest,
    FridgeToRecipeRequest
)

router = APIRouter()

@router.post("/text-to-recipe")
async def text_to_recipe(
    request: TextToRecipeRequest,
    # current_user: User = Depends(get_current_user)
    current_user: User = Depends(get_current_user)
):
    result = await ai_service.generate_recipe_from_text(request.description, request.preferences)
    return {"result": result}

@router.post("/text-to-image")
async def text_to_image(
    request: TextToImageRequest,
    current_user: User = Depends(get_current_user)
):
    url = await ai_service.generate_image(request.prompt)
    return {"url": url}

@router.post("/image-to-recipe")
async def image_to_recipe(
    request: ImageToRecipeRequest,
    current_user: User = Depends(get_current_user)
):
    # In a real app, user uploads file, backend uploads to storage (S3), gets URL, then calls AI
    # Here we assume frontend sends URL (e.g. from previously uploaded image)
    result = await ai_service.generate_recipe_from_image(request.image_url)
    return {"result": result}

@router.post("/image-to-calorie")
async def image_to_calorie(
    request: ImageToCalorieRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        print(f"DEBUG: Processing image-to-calorie request for URL: {request.image_url}")
        result = await ai_service.estimate_calories(request.image_url)
        print("DEBUG: AI Service result received")
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
    return {"result": result}
