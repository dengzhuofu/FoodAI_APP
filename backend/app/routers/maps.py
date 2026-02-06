from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
import httpx
from app.core.config import settings
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []
    session_id: Optional[int] = None

@router.post("/chat")
async def chat_with_map(request: ChatRequest):
    from app.services.amap_mcp_service import amap_service
    return await amap_service.chat(request.message, request.history, request.session_id)

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
        
        pois = []
        for poi in data.get("pois", []) or []:
            location = poi.get("location") or ""
            lng, lat = None, None
            if "," in location:
                lng_str, lat_str = location.split(",", 1)
                try:
                    lng = float(lng_str)
                    lat = float(lat_str)
                except Exception:
                    lng, lat = None, None
            pois.append({
                "id": poi.get("id"),
                "name": poi.get("name"),
                "address": poi.get("address") or poi.get("province") or "",
                "location": location,
                "latitude": lat,
                "longitude": lng,
                "distance": poi.get("distance"),
                "tel": poi.get("tel"),
            })
        return {"status": "1", "pois": pois}
             
@router.get("/route")
async def route_planning(
    type: str,
    origin: str,
    destination: str,
    city: Optional[str] = None,
    cityd: Optional[str] = None,
    strategy: int = 0
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
    
    if type in ("driving", "walking", "riding"):
        params["extensions"] = "all"

    if type == "driving":
        params["strategy"] = strategy

    if type == 'transit':
        params["city"] = city or "深圳市"
        params["cityd"] = cityd or params["city"]

    async with httpx.AsyncClient() as client:
        response = await client.get(f"{AMAP_BASE_URL}{endpoint_map[type]}", params=params)
        data = response.json()
        
        if data.get("status") != "1":
             print(f"Amap Route Error: {data}")
             return {"status": "0", "info": data.get("info"), "result": None}
        
        # Parse result to standardized format
        result = parse_route_result(type, data)
        return {"status": "1", "result": result}

@router.get("/around")
async def around_search(
    location: str,
    keywords: Optional[str] = None,
    types: Optional[str] = None,
    radius: int = 1000,
    page: int = 1,
    page_size: int = 20
):
    if not settings.AMAP_API_KEY:
        raise HTTPException(status_code=500, detail="AMAP_API_KEY not configured")

    params = {
        "key": settings.AMAP_API_KEY,
        "location": location,
        "radius": radius,
        "page": page,
        "offset": page_size,
        "extensions": "all",
        "sortrule": "distance",
    }
    if keywords:
        params["keywords"] = keywords
    if types:
        params["types"] = types

    async with httpx.AsyncClient() as client:
        response = await client.get(f"{AMAP_BASE_URL}/place/around", params=params)
        data = response.json()

        if data.get("status") != "1":
            print(f"Amap Around Error: {data}")
            return {"status": "0", "info": data.get("info"), "pois": []}

        pois = []
        for poi in data.get("pois", []) or []:
            loc = poi.get("location") or ""
            lng, lat = None, None
            if "," in loc:
                lng_str, lat_str = loc.split(",", 1)
                try:
                    lng = float(lng_str)
                    lat = float(lat_str)
                except Exception:
                    lng, lat = None, None
            pois.append({
                "id": poi.get("id"),
                "name": poi.get("name"),
                "address": poi.get("address") or poi.get("province") or "",
                "location": loc,
                "latitude": lat,
                "longitude": lng,
                "distance": poi.get("distance"),
                "tel": poi.get("tel"),
            })
        return {"status": "1", "pois": pois}

def parse_route_result(type: str, data: Dict[str, Any]):
    route = data.get("route", {})
    paths = route.get("paths", [])
    if not paths and type == 'transit':
        paths = route.get("transits", [])
    
    if not paths:
        return None
        
    path = paths[0]
    distance_meters = int(float(path.get("distance", 0) or 0))
    duration_seconds = int(float(path.get("duration", 0) or path.get("cost", {}).get("duration", 0) or 0))
    duration_in_traffic_seconds = None
    if type == "driving" and path.get("duration_in_traffic"):
        try:
            duration_in_traffic_seconds = int(float(path.get("duration_in_traffic", 0) or 0))
        except Exception:
            duration_in_traffic_seconds = None
    
    dist_str = format_distance(distance_meters)
    dur_str = format_duration(duration_in_traffic_seconds if duration_in_traffic_seconds else duration_seconds)

    points = []
    steps = path.get("steps", [])
    
    # Transit structure is different (segments -> bus/walking -> polyline)
    if type == 'transit':
        segments = path.get("segments", [])
        transit_steps = []
        for segment in segments:
            # Walking part
            if segment.get("walking"):
                for step in segment["walking"].get("steps", []):
                    points.extend(parse_polyline(step.get("polyline", "")))
                    transit_steps.append({
                        "instruction": step.get("instruction", ""),
                        "road": step.get("road") or "",
                        "action": step.get("action") or "",
                        "orientation": step.get("orientation") or "",
                        "distance_meters": int(float(step.get("distance", 0) or 0)),
                        "duration_seconds": int(float(step.get("duration", 0) or 0)),
                    })
            # Bus/Subway part
            if segment.get("bus"):
                for line in segment["bus"].get("buslines", []):
                    points.extend(parse_polyline(line.get("polyline", "")))
                    transit_steps.append({
                        "instruction": line.get("name") or "",
                        "road": "",
                        "action": "",
                        "orientation": "",
                        "distance_meters": int(float(line.get("distance", 0) or 0)),
                        "duration_seconds": int(float(line.get("duration", 0) or 0)),
                    })
    else:
        # Driving/Walking/Riding
        detail_steps = []
        for step in steps:
            points.extend(parse_polyline(step.get("polyline", "")))
            detail_steps.append({
                "instruction": step.get("instruction", ""),
                "road": step.get("road") or "",
                "action": step.get("action") or "",
                "orientation": step.get("orientation") or "",
                "distance_meters": int(float(step.get("distance", 0) or 0)),
                "duration_seconds": int(float(step.get("duration", 0) or 0)),
            })
            
    return {
        "type": type,
        "distance_meters": distance_meters,
        "duration_seconds": duration_seconds,
        "duration_in_traffic_seconds": duration_in_traffic_seconds,
        "distance": dist_str,
        "duration": dur_str,
        "path": points,
        "steps": transit_steps if type == "transit" else detail_steps
    }

def format_distance(distance_meters: int) -> str:
    if distance_meters <= 1000:
        return f"{distance_meters}米"
    return f"{round(distance_meters / 1000, 1)}公里"

def format_duration(duration_seconds: int) -> str:
    if duration_seconds <= 3600:
        return f"{max(1, round(duration_seconds / 60))}分钟"
    h = duration_seconds // 3600
    m = (duration_seconds % 3600) // 60
    return f"{h}小时{m}分钟"

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
