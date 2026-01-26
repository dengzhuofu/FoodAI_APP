from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from tortoise.contrib.fastapi import register_tortoise
from app.routers import auth, users, profile, inventory, content, explore, ai, upload, notifications, search
import os
import time
import json
from typing import Union

app = FastAPI(
    title="FoodAI API",
    description="Backend for Food Illustration App",
    version="1.0.0"
)

# Global Response Middleware
@app.middleware("http")
async def standard_response_middleware(request: Request, call_next):
    # Skip documentation and static files
    if request.url.path.startswith(("/docs", "/redoc", "/openapi.json", "/static")):
        return await call_next(request)
    
    # start_time = time.time()
    start_time = time.time()
    try:
        response = await call_next(request)
        
        # Calculate process time
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        # Handle JSON responses
        content_type = response.headers.get("content-type", "")
        if "application/json" in content_type:
            response_body = b""
            async for chunk in response.body_iterator:
                response_body += chunk
            
            try:
                data = json.loads(response_body)
                
                # Check if already formatted (avoid double wrapping)
                if isinstance(data, dict) and "status_code" in data and "data" in data:
                    # Remove content-length to allow recalculation
                    new_headers = dict(response.headers)
                    new_headers.pop("content-length", None)
                    
                    return JSONResponse(
                        content=data,
                        status_code=response.status_code,
                        headers=new_headers
                    )
                
                # Wrap in standard format
                wrapped_content = {
                    "status_code": response.status_code,
                    "message": "Success" if response.status_code < 400 else "Error",
                    "data": data,
                    "timestamp": int(time.time())
                }
                
                # Remove content-length to allow recalculation
                new_headers = dict(response.headers)
                new_headers.pop("content-length", None)
                
                return JSONResponse(
                    content=wrapped_content,
                    status_code=response.status_code,
                    headers=new_headers
                )
            except Exception:
                # If JSON parse fails, return original
                return Response(
                    content=response_body,
                    status_code=response.status_code, 
                    headers=dict(response.headers),
                    media_type=response.media_type
                )
                
        return response
        
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={
                "status_code": 500,
                "message": str(exc),
                "data": None,
                "timestamp": int(time.time())
            }
        )

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
if not os.path.exists("backend/static"):
    os.makedirs("backend/static")
app.mount("/static", StaticFiles(directory="backend/static"), name="static")

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(profile.router, prefix="/api/v1/users/me", tags=["profile"])
app.include_router(inventory.router, prefix="/api/v1", tags=["inventory"])
app.include_router(content.router, prefix="/api/v1", tags=["content"])
app.include_router(explore.router, prefix="/api/v1/explore", tags=["explore"])
app.include_router(search.router, prefix="/api/v1/search", tags=["search"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(upload.router, prefix="/api/v1", tags=["upload"])
app.include_router(notifications.router, prefix="/api/v1", tags=["notifications"])

@app.get("/")
async def root():
    return {"message": "Welcome to FoodAI API", "status": "running"}

register_tortoise(
    app,
    config=settings.TORTOISE_ORM,
    generate_schemas=True,
    add_exception_handlers=True,
    )
