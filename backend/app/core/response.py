from typing import Any, Optional
from pydantic import BaseModel
import time
from fastapi.responses import JSONResponse
from fastapi import Request, status

class StandardResponse(BaseModel):
    status_code: int
    message: str
    data: Optional[Any] = None
    timestamp: int

def success_response(data: Any = None, message: str = "Success") -> dict:
    return {
        "status_code": 200,
        "message": message,
        "data": data,
        "timestamp": int(time.time())
    }

def error_response(status_code: int, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "status_code": status_code,
            "message": message,
            "data": None,
            "timestamp": int(time.time())
        }
    )
