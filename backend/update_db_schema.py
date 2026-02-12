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

    try:
        await conn.execute_script("ALTER TABLE `recipes` ADD COLUMN `images` JSON;")
        print("Added images to recipes")
    except Exception as e:
        print(f"Failed to add images to recipes (might already exist): {e}")

    try:
        await conn.execute_script("ALTER TABLE `recipes` ADD COLUMN `video` VARCHAR(255) NULL;")
        print("Added video to recipes")
    except Exception as e:
        print(f"Failed to add video to recipes (might already exist): {e}")

    try:
        await conn.execute_script("ALTER TABLE `recipes` ADD COLUMN `tags` JSON;")
        print("Added tags to recipes")
    except Exception as e:
        print(f"Failed to add tags to recipes (might already exist): {e}")

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

    try:
        await conn.execute_script("ALTER TABLE `restaurants` ADD COLUMN `video` VARCHAR(255) NULL;")
        print("Added video to restaurants")
    except Exception as e:
        print(f"Failed to add video to restaurants (might already exist): {e}")

    # Update comments table
    try:
        await conn.execute_script("ALTER TABLE `comments` ADD COLUMN `images` JSON;")
        print("Added images to comments")
    except Exception as e:
        print(f"Failed to add images to comments (might already exist): {e}")

    # Add what_to_eat_presets table
    try:
        await conn.execute_script("""
            CREATE TABLE IF NOT EXISTS `what_to_eat_presets` (
                `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                `name` VARCHAR(50) NOT NULL,
                `options` JSON NOT NULL,
                `created_at` DATETIME(6) NOT NULL  DEFAULT CURRENT_TIMESTAMP(6),
                `user_id` BIGINT NOT NULL,
                CONSTRAINT `fk_what_to__users_e80d4` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
            );
        """)
        print("Created what_to_eat_presets table")
    except Exception as e:
        print(f"Failed to create what_to_eat_presets table: {e}")

    # Add shopping_items table
    try:
        await conn.execute_script("""
            CREATE TABLE IF NOT EXISTS `shopping_items` (
                `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                `name` VARCHAR(100) NOT NULL,
                `amount` VARCHAR(50),
                `is_checked` BOOL DEFAULT 0,
                `created_at` DATETIME(6) NOT NULL  DEFAULT CURRENT_TIMESTAMP(6),
                `user_id` BIGINT NOT NULL,
                CONSTRAINT `fk_shopping_users_123` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
            );
        """)
        print("Created shopping_items table")
    except Exception as e:
        print(f"Failed to create shopping_items table: {e}")

    # Add user_integrations table
    try:
        await conn.execute_script("""
            CREATE TABLE IF NOT EXISTS `user_integrations` (
                `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                `mcdonalds_token` VARCHAR(255),
                `updated_at` DATETIME(6) NOT NULL  DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                `user_id` BIGINT NOT NULL UNIQUE,
                CONSTRAINT `fk_user_int_users_123` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
            );
        """)
        print("Created user_integrations table")
    except Exception as e:
        print(f"Failed to create user_integrations table: {e}")

    # --- RBAC Tables ---

    # Add permissions table
    try:
        await conn.execute_script("""
            CREATE TABLE IF NOT EXISTS `permissions` (
                `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                `name` VARCHAR(100) NOT NULL,
                `code` VARCHAR(100) NOT NULL UNIQUE,
                `type` VARCHAR(20) NOT NULL,
                `parent_id` INT NULL
            );
        """)
        print("Created permissions table")
    except Exception as e:
        print(f"Failed to create permissions table: {e}")

    # Add roles table
    try:
        await conn.execute_script("""
            CREATE TABLE IF NOT EXISTS `roles` (
                `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                `name` VARCHAR(50) NOT NULL UNIQUE,
                `display_name` VARCHAR(50) NOT NULL,
                `description` LONGTEXT NULL,
                `is_system` BOOL NOT NULL DEFAULT 0
            );
        """)
        print("Created roles table")
    except Exception as e:
        print(f"Failed to create roles table: {e}")

    # Add roles_permissions table
    try:
        await conn.execute_script("""
            CREATE TABLE IF NOT EXISTS `roles_permissions` (
                `role_id` INT NOT NULL,
                `permission_id` INT NOT NULL,
                FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
                FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
            );
        """)
        print("Created roles_permissions table")
    except Exception as e:
        print(f"Failed to create roles_permissions table: {e}")

    # Add users_roles table
    try:
        await conn.execute_script("""
            CREATE TABLE IF NOT EXISTS `users_roles` (
                `user_id` BIGINT NOT NULL,
                `role_id` INT NOT NULL,
                FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
                FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
            );
        """)
        print("Created users_roles table")
    except Exception as e:
        print(f"Failed to create users_roles table: {e}")

    await Tortoise.close_connections()

if __name__ == "__main__":
    run_async(upgrade_db())
