from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import uuid
from typing import List
from app.services.oss_service import oss_service

router = APIRouter()

UPLOAD_DIR = "backend/static/uploads"

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Try OSS upload first if configured
        if oss_service.is_configured():
            try:
                key = f"uploads/{unique_filename}"
                url = await oss_service.upload_file(file, key)
                return {"url": url}
            except Exception as e:
                # Fallback proceeds below, ensure file pointer is reset
                await file.seek(0)
        
        # Local upload (Fallback)
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return relative URL
        return {"url": f"/static/uploads/{unique_filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
