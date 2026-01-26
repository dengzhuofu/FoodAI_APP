from typing import List, Optional
from app.schemas.example import ExampleCreate, ExampleResponse
from app.core.config import settings
import openai

class ExampleService:
    """
    Service for handling Example logic.
    Integrates with AI provider for content generation.
    """
    
    def __init__(self):
        # Initialize AI client here or via dependency injection
        self.ai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def process_item(self, item: ExampleCreate) -> ExampleResponse:
        """
        Process an item and enhance it with AI.
        """
        # 1. Business Logic
        processed_name = item.name.strip().title()

        # 2. AI Integration
        ai_description = await self._generate_ai_description(item.name)

        # 3. Return Response Schema
        return ExampleResponse(
            name=processed_name,
            description=ai_description,
            status="processed"
        )

    async def _generate_ai_description(self, topic: str) -> str:
        """
        Private helper for AI calls.
        """
        try:
            response = await self.ai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": f"Describe {topic} in one sentence."}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            # Log error
            print(f"AI Error: {e}")
            return "Description unavailable due to AI service error."
