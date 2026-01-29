from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
import httpx
from app.core.config import settings

router = APIRouter()

AMAP_BASE_URL = "https://restapi.amap.com/v3"

@router.get("/search")
async def search_location(
    keywords: str,
    city: Optional[str] = None,
    page: int = 1,
    page_size: int = 20
):
    if not settings.AMAP_API_KEY:
        raise HTTPException(status_code=500, detail="AMAP_API_KEY not configured")

    params = {
        "key": settings.AMAP_API_KEY,
        "keywords": keywords,
        "offset": page_size,
        "page": page,
        "extensions": "all"
    }
    
    if city:
        params["city"] = city

    async with httpx.AsyncClient() as client:
        response = await client.get(f"{AMAP_BASE_URL}/place/text", params=params)
        data = response.json()
        
        if data.get("status") != "1":
             print(f"Amap Error: {data}")
             return {"status": "0", "info": data.get("info"), "pois": []}
             
        return data

@router.get("/regeocode")
async def regeocode_location(location: str):
    """
    Inverse geocoding: convert lng,lat to address
    location: "lng,lat" (e.g., "116.481488,39.990464")
    """
    if not settings.AMAP_API_KEY:
         raise HTTPException(status_code=500, detail="AMAP_API_KEY not configured")

    params = {
        "key": settings.AMAP_API_KEY,
        "location": location,
        "extensions": "all",
        "radius": 1000,
        "roadlevel": 0
    }
        
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{AMAP_BASE_URL}/geocode/regeo", params=params)
        data = response.json()
        
        if data.get("status") != "1":
             print(f"Amap Error: {data}")
             return {"status": "0", "info": data.get("info"), "regeocode": {}}
             
        return data
