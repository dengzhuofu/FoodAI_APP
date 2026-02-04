import asyncio
from tortoise import Tortoise, connections
from app.core.config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def upgrade_db():
    logger.info("Initializing Tortoise...")
    await Tortoise.init(config=settings.TORTOISE_ORM)
    
    conn = connections.get("default")
    
    # Define the alterations
    # MySQL < 8.0 doesn't support IF NOT EXISTS in ADD COLUMN
    # We will try to add, and catch duplicate column error
    alterations = [
        # Recipes table changes
        "ALTER TABLE recipes ADD COLUMN cuisine VARCHAR(50) NULL;",
        "ALTER TABLE recipes ADD COLUMN category VARCHAR(50) NULL;",
        # "ALTER TABLE recipes ADD COLUMN tags JSON NULL;",
           "ALTER TABLE recipes ADD COLUMN tags JSON NULL;",
        
        # Restaurants table changes
        "ALTER TABLE restaurants ADD COLUMN cuisine VARCHAR(50) NULL;",
        "ALTER TABLE restaurants ADD COLUMN latitude DOUBLE NULL;",
        "ALTER TABLE restaurants ADD COLUMN longitude DOUBLE NULL;",
    ]
    
    logger.info("Starting schema upgrade...")
    
    for sql in alterations:
        try:
            logger.info(f"Executing: {sql}")
            await conn.execute_script(sql)
            logger.info("Success")
        except Exception as e:
            # Check if error is "Duplicate column name" which means column exists
            if "Duplicate column name" in str(e) or "1060" in str(e):
                logger.info("Column already exists, skipping.")
            else:
                logger.error(f"Error executing SQL: {e}")
                # We don't raise here to allow other columns to be added
    
    logger.info("Schema upgrade completed.")
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(upgrade_db())
