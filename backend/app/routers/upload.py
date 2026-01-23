from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import uuid
from typing import List
from app.services.cos_service import cos_service

router = APIRouter()

UPLOAD_DIR = "backend/static/uploads"

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Try COS upload first if configured
        if cos_service.is_configured():
            try:
                # We put uploads in an 'uploads/' folder in the bucket to keep it clean
                key = f"uploads/{unique_filename}"
                print(f"Attempting to upload to COS: {key}")
                url = await cos_service.upload_file(file, key)
                print(f"COS upload successful: {url}")
                return {"url": url}
            except Exception as e:
                print(f"COS upload failed, falling back to local: {e}")
                # Fallback proceeds below, ensure file pointer is reset
                await file.seek(0)
        else:
            print("COS not configured, using local storage.")
        
        # Local upload (Fallback)
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return relative URL
        return {"url": f"/static/uploads/{unique_filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
