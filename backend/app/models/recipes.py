from tortoise import fields, models

class Recipe(models.Model):
    id = fields.BigIntField(pk=True)
    author = fields.ForeignKeyField("models.User", related_name="recipes")
    title = fields.CharField(max_length=100)
    cover_image = fields.CharField(max_length=255)
    images = fields.JSONField(default=list)  # List of image URLs
    video = fields.CharField(max_length=255, null=True)  # Video URL
    description = fields.TextField(null=True)
    cooking_time = fields.CharField(max_length=20, null=True)
    difficulty = fields.CharField(max_length=20, null=True)
    cuisine = fields.CharField(max_length=50, null=True)  # 菜系
    category = fields.CharField(max_length=50, null=True)  # 食材/分类
    tags = fields.JSONField(default=list)  # Added tags field
    calories = fields.IntField(null=True)
    nutrition = fields.JSONField(null=True)  # {protein, fat, carbs}
    ingredients = fields.JSONField(default=list)
    steps = fields.JSONField(default=list)
    likes_count = fields.IntField(default=0)
    views_count = fields.IntField(default=0)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "recipes"

class RecipeStep(models.Model):
    id = fields.BigIntField(pk=True)
    recipe = fields.ForeignKeyField("models.Recipe", related_name="recipe_steps")
    step_number = fields.IntField()
    description = fields.TextField()
    image = fields.CharField(max_length=255, null=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "recipe_steps"
        ordering = ["step_number"]

class Comment(models.Model):
    id = fields.BigIntField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="comments")
    target_id = fields.BigIntField()
    target_type = fields.CharField(max_length=20)  # 'recipe', 'restaurant'
    content = fields.TextField()
    rating = fields.IntField(null=True)
    images = fields.JSONField(default=list)  # Added images field
    parent = fields.ForeignKeyField("models.Comment", related_name="replies", null=True)
    level = fields.IntField(default=0)
    root_parent_id = fields.BigIntField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "comments"

class Collection(models.Model):
    id = fields.BigIntField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="collections")
    target_id = fields.BigIntField()
    target_type = fields.CharField(max_length=20)  # 'recipe', 'restaurant'
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "collections"
        unique_together = ("user", "target_id", "target_type")

class Like(models.Model):
    id = fields.BigIntField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="likes")
    target_id = fields.BigIntField()
    target_type = fields.CharField(max_length=20)  # 'recipe', 'restaurant'
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "likes"
        unique_together = ("user", "target_id", "target_type")

class ViewHistory(models.Model):
    id = fields.BigIntField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="view_history")
    target_id = fields.BigIntField()
    target_type = fields.CharField(max_length=20)  # 'recipe', 'restaurant'
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "view_history"
