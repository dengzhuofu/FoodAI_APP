import json
import os

def escape_sql_string(value):
    if value is None:
        return "NULL"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, (list, dict)):
        return "'" + json.dumps(value, ensure_ascii=False).replace("'", "''") + "'"
    return "'" + str(value).replace("'", "''") + "'"

def generate_sql():
    json_path = "backend/data/recipes.json"
    sql_path = "backend/data/recipes.sql"
    
    if not os.path.exists(json_path):
        print(f"JSON file not found: {json_path}")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        recipes = json.load(f)

    print(f"Generating SQL for {len(recipes)} recipes...")
    
    with open(sql_path, 'w', encoding='utf-8') as f:
        f.write("-- Auto-generated SQL script to import recipes\n")
        f.write("SET NAMES utf8mb4;\n\n")
        
        # We need a default user ID. Assuming 1 for admin.
        # If the user doesn't exist, this might fail on foreign key constraint,
        # so we optionally insert a default user if not exists.
        f.write("-- Ensure a default user exists (ID=1)\n")
        f.write("INSERT IGNORE INTO `users` (`id`, `username`, `email`, `password_hash`, `nickname`, `created_at`) VALUES (1, 'admin', 'admin@example.com', 'placeholder', 'Admin', NOW());\n\n")
        
        for recipe in recipes:
            title = escape_sql_string(recipe.get('title'))
            cover_image = escape_sql_string(recipe.get('cover_image', ''))
            images = escape_sql_string(recipe.get('images', []))
            description = escape_sql_string(recipe.get('description', ''))
            cooking_time = escape_sql_string(recipe.get('cooking_time', ''))
            difficulty = escape_sql_string(recipe.get('difficulty', ''))
            cuisine = escape_sql_string(recipe.get('cuisine', ''))
            category = escape_sql_string(recipe.get('category', ''))
            ingredients = escape_sql_string(recipe.get('ingredients', []))
            steps = escape_sql_string(recipe.get('steps', []))
            tags = escape_sql_string(recipe.get('tags', []))
            calories = escape_sql_string(recipe.get('calories', 0))
            nutrition = escape_sql_string(recipe.get('nutrition', {}))
            
            # Using INSERT IGNORE to avoid duplicates based on unique constraints if any, or just simple insert
            # Assuming title might be unique or we just want to insert.
            # Adjust table name if needed (usually 'recipes')
            sql = f"""
INSERT INTO `recipes` (
    `author_id`, `title`, `cover_image`, `images`, `description`, 
    `cooking_time`, `difficulty`, `cuisine`, `category`, 
    `ingredients`, `steps`, `tags`, `calories`, `nutrition`, `created_at`
) VALUES (
    1, {title}, {cover_image}, {images}, {description},
    {cooking_time}, {difficulty}, {cuisine}, {category},
    {ingredients}, {steps}, {tags}, {calories}, {nutrition}, NOW()
);
"""
            f.write(sql.strip() + "\n")

            
    print(f"SQL script saved to {sql_path}")

if __name__ == "__main__":
    generate_sql()
