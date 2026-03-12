import asyncio
import json
import os
import sys

# Add backend directory to path so we can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from tortoise import Tortoise, run_async
from app.models.recipes import Recipe
from app.models.users import User
# from app.core.config import settings

# Since we are running as a script, we might need to load environment variables manually if settings are not loaded correctly
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
# Or just hardcode for local dev if dotenv fails, but better to try loading
# Assuming settings.DATABASE_URL works if imported after dotenv

# If settings import fails due to pydantic, we can construct DB URL manually or mock it
try:
    from app.core.config import settings
    # DB_URL = settings.DATABASE_URL
    # Force use local DB for this script if the env var points to something that doesn't work locally
    # Or try the one from env first
    DB_URL = os.getenv("DATABASE_URL")
except Exception:
    DB_URL = os.getenv("DATABASE_URL", "mysql://root:123456@localhost:3306/food_illustration_db")

async def init_db():
    # List of candidate URLs to try
    urls = [
        DB_URL, # From env
        "mysql://root:1st1st1st@localhost:3306/food_ai", # Local default
        "mysql://root:password@localhost:3306/food_ai", # Another common local default
    ]
    
    # Filter out None and duplicates
    urls = list(dict.fromkeys([u for u in urls if u]))
    
    connected = False
    last_error = None
    
    for url in urls:
        try:
            print(f"Trying to connect to DB: {url.split('@')[-1]} ...") # Hide password
            await Tortoise.init(
                db_url=url,
                modules={'models': ['app.models.recipes', 'app.models.users', 'app.models.rbac']}
            )
            await Tortoise.generate_schemas()
            print("Connected successfully!")
            connected = True
            break
        except Exception as e:
            print(f"Failed to connect: {e}")
            last_error = e
            
    if not connected:
        raise last_error

async def import_recipes():
    print("Initializing database...")
    await init_db()

    # Ensure a default user exists for the author field
    default_user = await User.first()
    if not default_user:
        print("Creating default user...")
        default_user = await User.create(
            username="admin",
            email="admin@example.com",
            hashed_password="hashed_password_placeholder"
        )
    
    file_path = "backend/data/recipes.json"
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    print(f"Reading recipes from {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        recipes_data = json.load(f)

    count = 0
    for data in recipes_data:
        # Check if recipe already exists
        exists = await Recipe.filter(title=data['title']).exists()
        if exists:
            print(f"Skipping existing recipe: {data['title']}")
            continue
            
        print(f"Importing: {data['title']}")
        await Recipe.create(
            author=default_user,
            title=data['title'],
            cover_image=data.get('cover_image', ''),
            images=data.get('images', []),
            description=data.get('description', ''),
            cooking_time=data.get('cooking_time', ''),
            difficulty=data.get('difficulty', ''),
            cuisine=data.get('cuisine', ''),
            category=data.get('category', ''),
            ingredients=data.get('ingredients', []),
            steps=data.get('steps', []),
            tags=data.get('tags', []),
            calories=data.get('calories', 0),
            nutrition=data.get('nutrition', {})
        )
        count += 1

    print(f"Successfully imported {count} new recipes.")
    await Tortoise.close_connections()

if __name__ == "__main__":
    run_async(import_recipes())
