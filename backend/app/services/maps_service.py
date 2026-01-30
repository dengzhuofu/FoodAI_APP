import httpx
from app.core.config import settings

AMAP_BASE_URL = "https://restapi.amap.com/v3"

async def geocode_address(address: str, city: str = None):
    """
    Geocoding: convert address to lng,lat
    """
    if not settings.AMAP_API_KEY:
        return None

    params = {
        "key": settings.AMAP_API_KEY,
        "address": address,
    }
    if city:
        params["city"] = city
        
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{AMAP_BASE_URL}/geocode/geo", params=params)
            data = response.json()
            if data.get("status") == "1" and data.get("geocodes"):
                return data["geocodes"][0] # Returns {location: "lng,lat", ...}
        except Exception as e:
            print(f"Geocoding error: {e}")
            return None
    return None

async def search_location_api(keywords: str, city: str = None, page: int = 1, page_size: int = 20):
    if not settings.AMAP_API_KEY:
        return None

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
        try:
            response = await client.get(f"{AMAP_BASE_URL}/place/text", params=params)
            return response.json()
        except Exception:
            return None

async def regeocode_location_api(location: str):
    if not settings.AMAP_API_KEY:
        return None

    params = {
        "key": settings.AMAP_API_KEY,
        "location": location,
        "extensions": "all",
        "radius": 1000,
        "roadlevel": 0
    }
        
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{AMAP_BASE_URL}/geocode/regeo", params=params)
            return response.json()
        except Exception:
            return None
