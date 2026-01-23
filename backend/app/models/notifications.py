from tortoise import fields, models

class Notification(models.Model):
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="notifications")
    type = fields.CharField(max_length=20)  # 'system', 'like', 'comment', 'follow'
    title = fields.CharField(max_length=100)
    content = fields.TextField()
    target_id = fields.IntField(null=True)
    target_type = fields.CharField(max_length=20, null=True)  # 'recipe', 'restaurant', 'user'
    is_read = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)
    
    sender = fields.ForeignKeyField("models.User", related_name="sent_notifications", null=True) # Who triggered this

    class Meta:
        table = "notifications"
