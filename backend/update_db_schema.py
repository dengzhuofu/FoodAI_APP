from tortoise import Tortoise, run_async
from app.core.config import settings

async def upgrade_db():
    await Tortoise.init(config=settings.TORTOISE_ORM)
    conn = Tortoise.get_connection("default")
    
    # Update recipes table
    try:
        await conn.execute_script("ALTER TABLE `recipes` ADD COLUMN `views_count` INT DEFAULT 0;")
        print("Added views_count to recipes")
    except Exception as e:
        print(f"Failed to update recipes (might already exist): {e}")

    # Update restaurants table
    try:
        await conn.execute_script("ALTER TABLE `restaurants` ADD COLUMN `views_count` INT DEFAULT 0;")
        print("Added views_count to restaurants")
    except Exception as e:
        print(f"Failed to add views_count to restaurants (might already exist): {e}")

    try:
        await conn.execute_script("ALTER TABLE `restaurants` ADD COLUMN `category` VARCHAR(50) NULL;")
        print("Added category to restaurants")
    except Exception as e:
        print(f"Failed to add category to restaurants (might already exist): {e}")

    await Tortoise.close_connections()

if __name__ == "__main__":
    run_async(upgrade_db())
