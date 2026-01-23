from tortoise import Tortoise, run_async
from app.core.config import settings
from app.models.users import User, UserProfile
from app.models.recipes import Recipe
from app.models.inventory import FridgeItem
from app.models.restaurants import Restaurant
from app.core.security import get_password_hash
import datetime

async def seed():
    print("Initializing Tortoise ORM...")
    await Tortoise.init(config=settings.TORTOISE_ORM)
    
    print("Checking for existing data...")
    if await User.filter(username="testuser").exists():
        print("Test user already exists. Skipping seed.")
        return

    print("Creating test user...")
    user = await User.create(
        username="testuser",
        email="test@example.com",
        password_hash=get_password_hash("password123"),
        nickname="Test Chef",
        bio="I love coding and cooking!",
        is_pro=True
    )
    
    await UserProfile.create(
        user=user,
        preferences=["Italian", "Chinese"],
        allergies=["Peanuts"],
        health_goals=["Muscle Gain"]
    )

    print("Creating fridge items...")
    await FridgeItem.create(user=user, name="Eggs", category="Protein", quantity="12", icon="🥚", expiry_date=datetime.date.today() + datetime.timedelta(days=7))
    await FridgeItem.create(user=user, name="Milk", category="Dairy", quantity="1L", icon="🥛", expiry_date=datetime.date.today() + datetime.timedelta(days=5))
    await FridgeItem.create(user=user, name="Tomatoes", category="Vegetable", quantity="5", icon="🍅", expiry_date=datetime.date.today() + datetime.timedelta(days=3))

    print("Creating recipes...")
    await Recipe.create(
        author=user,
        title="Tomato Scrambled Eggs",
        cover_image="https://example.com/tomato_eggs.jpg",
        description="A classic Chinese home-cooked dish.",
        cooking_time="10 min",
        difficulty="Easy",
        calories=300,
        nutrition={"protein": "15g", "fat": "20g", "carbs": "5g"},
        ingredients=["2 Tomatoes", "3 Eggs", "Salt", "Oil"],
        steps=["Beat eggs", "Chop tomatoes", "Stir fry eggs", "Stir fry tomatoes", "Mix together"]
    )

    print("Creating restaurants...")
    await Restaurant.create(
        author=user,
        name="Tasty Burger",
        title="Best Burgers in Town",
        content="Juicy burgers with fresh ingredients.",
        address="123 Food St",
        rating=4.5,
        hours="10:00 - 22:00",
        phone="123-456-7890"
    )

    print("Seed data created successfully!")

if __name__ == "__main__":
    run_async(seed())
