# AI Integration Patterns

## AI Service Layer

Encapsulate all AI interactions within dedicated services. Do not scatter LLM calls in routers.

### 1. Basic Wrapper

```python
import openai
from app.core.config import settings

class AIService:
    def __init__(self):
        self.client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def get_completion(self, prompt: str) -> str:
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        except Exception as e:
            # Log error and re-raise or handle gracefully
            raise e
```

## Prompt Engineering

- **Templates**: Store prompts in a separate file or constant, not inline.
- **Variables**: Use f-strings or Jinja2 for dynamic prompt construction.
- **System Prompts**: Always include a system prompt to define the AI's persona and constraints.

## Streaming Responses

For long generations, use FastAPI's `StreamingResponse`.

```python
from fastapi.responses import StreamingResponse

async def stream_generator(prompt: str):
    stream = await client.chat.completions.create(..., stream=True)
    async for chunk in stream:
        yield chunk.choices[0].delta.content or ""

@router.post("/chat")
async def chat_endpoint(prompt: str):
    return StreamingResponse(stream_generator(prompt), media_type="text/event-stream")
```

## Context Management

- For conversational AI, maintain a history of messages.
- Store history in Redis or Postgres if persistence is needed.
- Limit context window (truncate old messages) to avoid token limits.

## Cost & Latency Optimization

- **Caching**: Cache identical requests using Redis.
- **Model Selection**: Use smaller/cheaper models (e.g., gpt-3.5-turbo, haiku) for simple tasks.
- **Timeout**: Set explicit timeouts for AI calls to prevent hanging requests.
