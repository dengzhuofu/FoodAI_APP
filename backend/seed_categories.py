from tortoise import Tortoise, run_async
from app.core.config import settings
from app.models.recipes import Recipe
from app.models.restaurants import Restaurant
import random

CATEGORIES = ["减脂", "快手菜", "早餐", "下午茶", "低卡", "增肌", "便当", "烘焙", "素食", "川菜"]

async def seed_data():
    await Tortoise.init(config=settings.TORTOISE_ORM)
    
    print("Seeding categories and views for Recipes...")
    recipes = await Recipe.all()
    for r in recipes:
        r.category = random.choice(CATEGORIES)
        r.views_count = random.randint(100, 10000)
        # Also randomize likes if 0, for better demo
        if r.likes_count == 0:
            r.likes_count = random.randint(0, 500)
        await r.save()
    print(f"Updated {len(recipes)} recipes.")

    print("Seeding categories and views for Restaurants...")
    restaurants = await Restaurant.all()
    for r in restaurants:
        r.category = random.choice(CATEGORIES)
        r.views_count = random.randint(100, 10000)
        if r.likes_count == 0:
            r.likes_count = random.randint(0, 500)
        await r.save()
    print(f"Updated {len(restaurants)} restaurants.")

    await Tortoise.close_connections()

if __name__ == "__main__":
    run_async(seed_data())
