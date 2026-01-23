from tortoise import Tortoise, run_async
from app.core.config import settings

async def init():
    print("Initializing Tortoise ORM...")
    await Tortoise.init(config=settings.TORTOISE_ORM)
    print("Generating database schemas...")
    await Tortoise.generate_schemas()
    print("Database schemas generated successfully!")

if __name__ == "__main__":
    run_async(init())
