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
             
@router.get("/route")
async def route_planning(
    type: str,
    origin: str,
    destination: str
):
    """
    Route Planning API wrapper
    type: 'driving' | 'walking' | 'transit' | 'riding'
    """
    if not settings.AMAP_API_KEY:
         raise HTTPException(status_code=500, detail="AMAP_API_KEY not configured")

    endpoint_map = {
        'driving': '/direction/driving',
        'walking': '/direction/walking',
        'transit': '/direction/transit/integrated',
        'riding': '/direction/bicycling'
    }
    
    if type not in endpoint_map:
        raise HTTPException(status_code=400, detail="Invalid route type")

    params = {
        "key": settings.AMAP_API_KEY,
        "origin": origin,
        "destination": destination,
    }
    
    if type == 'transit':
        # Transit requires city, simplified here to assume same city or handle appropriately
        # For now, we default to Shenzhen or extract from origin/dest logic if needed
        # But integrated transit API usually needs city for origin and destination if cross-city
        params["city"] = "深圳市" # Default
        params["cityd"] = "深圳市" 

    async with httpx.AsyncClient() as client:
        response = await client.get(f"{AMAP_BASE_URL}{endpoint_map[type]}", params=params)
        data = response.json()
        
        if data.get("status") != "1":
             print(f"Amap Route Error: {data}")
             return {"status": "0", "info": data.get("info"), "result": None}
        
        # Parse result to standardized format
        result = parse_route_result(type, data)
        return {"status": "1", "result": result}

def parse_route_result(type: str, data: Dict[str, Any]):
    route = data.get("route", {})
    paths = route.get("paths", [])
    if not paths and type == 'transit':
        paths = route.get("transits", [])
    
    if not paths:
        return None
        
    path = paths[0]
    distance = int(path.get("distance", 0))
    duration = int(path.get("duration", 0) or path.get("cost", {}).get("duration", 0))
    
    # Format distance
    dist_str = f"{distance}米"
    if distance > 1000:
        dist_str = f"{round(distance/1000, 1)}公里"
        
    # Format duration
    dur_str = f"{round(duration/60)}分钟"
    if duration > 3600:
        h = duration // 3600
        m = (duration % 3600) // 60
        dur_str = f"{h}小时{m}分钟"

    # Extract coordinates for polyline
    points = []
    steps = path.get("steps", [])
    
    # Transit structure is different (segments -> bus/walking -> polyline)
    if type == 'transit':
        segments = path.get("segments", [])
        for segment in segments:
            # Walking part
            if segment.get("walking"):
                for step in segment["walking"].get("steps", []):
                    points.extend(parse_polyline(step.get("polyline", "")))
            # Bus/Subway part
            if segment.get("bus"):
                for line in segment["bus"].get("buslines", []):
                    points.extend(parse_polyline(line.get("polyline", "")))
    else:
        # Driving/Walking/Riding
        for step in steps:
            points.extend(parse_polyline(step.get("polyline", "")))
            
    return {
        "distance": dist_str,
        "duration": dur_str,
        "path": points
    }

def parse_polyline(polyline_str: str) -> List[Dict[str, float]]:
    if not polyline_str:
        return []
    res = []
    for point in polyline_str.split(";"):
        if "," in point:
            lng, lat = map(float, point.split(","))
            res.append({"latitude": lat, "longitude": lng})
    return res

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
