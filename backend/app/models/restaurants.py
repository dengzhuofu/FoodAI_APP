from tortoise import fields, models

class Restaurant(models.Model):
    id = fields.BigIntField(pk=True)
    author = fields.ForeignKeyField("models.User", related_name="restaurants")
    name = fields.CharField(max_length=100)
    title = fields.CharField(max_length=100)
    content = fields.TextField(null=True)
    images = fields.JSONField(default=list)
    video = fields.CharField(max_length=255, null=True)  # Video URL
    address = fields.CharField(max_length=255, null=True)
    rating = fields.FloatField(null=True)
    cuisine = fields.CharField(max_length=50, null=True)  # 菜系
    category = fields.CharField(max_length=50, null=True)  # 分类
    latitude = fields.FloatField(null=True)
    longitude = fields.FloatField(null=True)
    hours = fields.CharField(max_length=50, null=True)
    phone = fields.CharField(max_length=20, null=True)
    likes_count = fields.IntField(default=0)
    views_count = fields.IntField(default=0)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "restaurants"
