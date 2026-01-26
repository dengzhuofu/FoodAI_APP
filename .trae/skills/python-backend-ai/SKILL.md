---
name: python-backend-ai
description: Expert guide for generating Python backend code (FastAPI) with AI capabilities. Use this skill when the user requests backend development, refactoring, or AI feature integration.
---

# Python Backend & AI Development Skill

This skill provides standardized workflows, architectural patterns, and code templates for building production-ready Python backends using FastAPI, with a specific focus on integrating AI functionalities.

## When to Use This Skill

Use this skill when the user asks to:
- Create new backend API endpoints or modules.
- Integrate AI features (LLM calls, embeddings, image generation) into the backend.
- Refactor existing backend code for better performance or structure.
- Generate database models or Pydantic schemas.

## Core Architecture

We follow a **Service-Repository-Router** pattern to ensure separation of concerns:

1.  **Routers (`app/routers/`)**: Handle HTTP requests/responses, dependency injection, and input validation.
2.  **Services (`app/services/`)**: Contain business logic and AI orchestration. **AI logic goes here.**
3.  **Schemas (`app/schemas/`)**: Pydantic models for request/response validation.
4.  **Models (`app/models/`)**: Database ORM models (SQLAlchemy/Tortoise/etc.).
5.  **Utils (`app/utils/`)**: Helper functions (security, hashing, generic AI wrappers).

## Development Workflow

### 1. Define Schemas First
Always start by defining the data contract in `app/schemas/`. Use strict type hinting.

```python
# app/schemas/item.py
from pydantic import BaseModel, Field

class ItemCreate(BaseModel):
    name: str = Field(..., description="Name of the item")
    description: str | None = None
```

### 2. Implement Service Logic
Place complex logic, especially AI calls, in a service class.

```python
# app/services/ai_service.py
from app.schemas.item import ItemCreate

class AIService:
    async def generate_description(self, item: ItemCreate) -> str:
        # AI logic here
        pass
```

### 3. Create Router Endpoint
Inject the service into the router. Ensure endpoint paths and function names are descriptive and follow RESTful conventions (e.g., `POST /items` not `/createItem`).

```python
# app/routers/items.py
from fastapi import APIRouter, Depends
from app.services.ai_service import AIService

router = APIRouter()

@router.post("/generate")
async def generate_item(item: ItemCreate, service: AIService = Depends()):
    return await service.generate_description(item)
```

## AI Integration Standards

- **Async is Mandatory**: AI calls are I/O bound. Always use `async def` and `await`.
- **Streaming**: For long-running AI tasks, prefer StreamingResponse.
- **Error Handling**: Wrap AI calls in try/except blocks and raise `HTTPException` with clear messages.
- **Configuration**: Never hardcode API keys. Use `app/core/config.py` or environment variables.

## Reference Documentation

- **[FastAPI Standards](references/fastapi_standards.md)**: Detailed guide on project structure, error handling, and testing.
- **[AI Patterns](references/ai_patterns.md)**: Best practices for prompt engineering, context management, and LLM switching.
