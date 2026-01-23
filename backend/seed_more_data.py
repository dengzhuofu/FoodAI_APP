from tortoise import Tortoise, run_async
from app.core.config import settings
from app.models.recipes import Recipe
from app.models.restaurants import Restaurant
from app.models.users import User
import random
from datetime import datetime, timedelta

CATEGORIES = ["减脂", "快手菜", "早餐", "下午茶", "低卡", "增肌", "便当", "烘焙", "素食", "川菜"]
CUISINES = ["川菜", "粤菜", "湘菜", "鲁菜", "苏菜", "浙菜", "徽菜", "闽菜", "日料", "韩餐", "西餐"]

RECIPE_TITLES = [
    "香煎鸡胸肉", "牛油果全麦三明治", "低脂燕麦粥", "经典红烧肉", "清蒸鲈鱼", 
    "番茄炒蛋", "蒜蓉西兰花", "宫保鸡丁", "麻婆豆腐", "酸菜鱼",
    "日式肥牛饭", "韩式拌饭", "意式肉酱面", "凯撒沙拉", "水果酸奶杯",
    "全麦欧包", "提拉米苏", "抹茶千层", "蓝莓芝士蛋糕", "手冲咖啡"
]

RESTAURANT_NAMES = [
    "老张家常菜", "米其林三星", "深夜食堂", "必胜客", "星巴克", 
    "海底捞", "喜茶", "肯德基", "麦当劳", "外婆家",
    "绿茶餐厅", "西贝莜面村", "真功夫", "沙县小吃", "兰州拉面",
    "日式居酒屋", "韩式烤肉", "意式餐厅", "法式甜品店", "网红咖啡馆"
]

IMAGES = [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500",
    "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500",
    "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=500",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=500",
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500"
]

async def seed_more_data():
    await Tortoise.init(config=settings.TORTOISE_ORM)
    
    # Ensure we have at least one user
    user = await User.first()
    if not user:
        print("No users found. Creating a default user...")
        user = await User.create(
            username="testuser", 
            email="test@example.com", 
            password_hash="hashed_password_placeholder",
            nickname="Test Chef"
        )
    
    print(f"Using user: {user.username}")

    # Create Recipes
    print("Creating 20 random recipes...")
    for i in range(20):
        title = random.choice(RECIPE_TITLES)
        category = random.choice(CATEGORIES)
        image = random.choice(IMAGES)
        
        await Recipe.create(
            author=user,
            title=f"{title} {i+1}",
            cover_image=image,
            description=f"这是一道美味的{title}，属于{category}分类。",
            cooking_time=f"{random.randint(10, 60)}分钟",
            difficulty=random.choice(["简单", "中等", "困难"]),
            cuisine=random.choice(CUISINES),
            category=category,
            calories=random.randint(200, 800),
            likes_count=random.randint(0, 1000),
            views_count=random.randint(100, 10000),
            ingredients=["食材1", "食材2", "调料"],
            steps=["第一步", "第二步", "第三步"]
        )

    # Create Restaurants
    print("Creating 20 random restaurants...")
    for i in range(20):
        name = random.choice(RESTAURANT_NAMES)
        category = random.choice(CATEGORIES)
        image = random.choice(IMAGES)
        
        await Restaurant.create(
            author=user,
            name=f"{name} {i+1}号店",
            title=f"探店：{name} {i+1}",
            content=f"今天打卡了{name}，味道真不错，推荐大家来尝尝。",
            images=[image],
            address=f"美食街{random.randint(1, 999)}号",
            rating=round(random.uniform(3.0, 5.0), 1),
            cuisine=random.choice(CUISINES),
            category=category,
            likes_count=random.randint(0, 1000),
            views_count=random.randint(100, 10000),
            hours="10:00 - 22:00",
            phone="12345678"
        )

    print("Done seeding data.")
    await Tortoise.close_connections()

if __name__ == "__main__":
    run_async(seed_more_data())
