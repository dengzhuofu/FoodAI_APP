from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from tortoise.contrib.fastapi import register_tortoise
from app.routers import auth, users, profile, inventory, content, explore, ai, upload, notifications, search, shopping, maps, chats, mcdonalds, health, admin
from app.mcp_server import mcp
from mcp.server.sse import SseServerTransport
from starlette.routing import Mount, Route

import os
import time
import json
from typing import Union

app = FastAPI(
    title="FoodAI API",
    description="Backend for Food Illustration App",
    version="1.0.0"
)

def _cors_headers(request: Request) -> dict:
    requested_headers = request.headers.get("access-control-request-headers")
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": requested_headers or "*",
        "Access-Control-Max-Age": "86400",
    }

# Global Response Middleware
@app.middleware("http")
async def standard_response_middleware(request: Request, call_next):
    if request.method == "OPTIONS":
        return Response(status_code=204, headers=_cors_headers(request))

    # Skip documentation and static files
    if request.url.path.startswith(("/docs", "/redoc", "/openapi.json", "/static")):
        return await call_next(request)
    
    # start_time = time.time()
    start_time = time.time()
    try:
        response = await call_next(request)

        for k, v in _cors_headers(request).items():
            response.headers.setdefault(k, v)
        
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
            },
            headers=_cors_headers(request)
        )

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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
app.include_router(chats.router, prefix="/api/v1", tags=["chats"])
app.include_router(shopping.router, prefix="/api/v1/shopping-list", tags=["shopping"])
app.include_router(maps.router, prefix="/api/v1/maps", tags=["maps"])
app.include_router(mcdonalds.router, prefix="/api/v1/mcdonalds", tags=["mcdonalds"])
app.include_router(health.router, prefix="/api/v1/health", tags=["health"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])

# --- Mount MCP Server (SSE) ---
# We use mcp.server.sse.SseServerTransport to handle SSE connections
# Since FastMCP doesn't directly expose an ASGI app for SSE yet (it wraps Starlette internally but for standalone),
# we will use the 'sse_handler' provided by mcp.server.sse

sse = SseServerTransport("/api/v1/mcp/messages")

@app.get("/api/v1/mcp/sse")
async def handle_sse(request: Request):
    async with sse.connect_sse(request.scope, request.receive, request._send) as streams:
        await mcp.run(
            read_stream=streams[0],
            write_stream=streams[1],
            initialization_options=mcp.create_initialization_options()
        )

@app.post("/api/v1/mcp/messages")
async def handle_messages(request: Request):
    await sse.handle_post_message(request.scope, request.receive, request._send)




@app.get("/")
async def root():
    return {"message": "Welcome to FoodAI API", "status": "running"}

register_tortoise(
    app,
    config=settings.TORTOISE_ORM,
    generate_schemas=True,
    add_exception_handlers=True,
    )


@app.on_event("startup")
async def seed_system_notifications():
    from app.models.users import User
    from app.models.notifications import Notification

    users = await User.all().limit(200)
    for u in users:
        exists = await Notification.filter(user=u, type="system").exists()
        if exists:
            continue
        await Notification.create(
            user=u,
            type="system",
            title="系统消息",
            content="欢迎使用 Food Illustration App！这里会展示系统通知与聊天消息。",
            is_read=False,
            sender=None,
        )
