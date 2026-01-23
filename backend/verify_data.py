from tortoise import Tortoise, run_async
from app.core.config import settings
from app.models.users import User
from app.models.recipes import Recipe
from app.models.inventory import FridgeItem

async def verify():
    print("Connecting to DB...")
    await Tortoise.init(config=settings.TORTOISE_ORM)
    
    user_count = await User.all().count()
    recipe_count = await Recipe.all().count()
    fridge_count = await FridgeItem.all().count()
    
    print(f"Users: {user_count}")
    print(f"Recipes: {recipe_count}")
    print(f"Fridge Items: {fridge_count}")
    
    if user_count > 0 and recipe_count > 0:
        print("VERIFICATION SUCCESSFUL: Data exists.")
    else:
        print("VERIFICATION FAILED: Data missing.")

if __name__ == "__main__":
    run_async(verify())
