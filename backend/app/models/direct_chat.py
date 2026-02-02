from tortoise import fields, models


class DirectConversation(models.Model):
    id = fields.BigIntField(pk=True)
    user_low = fields.ForeignKeyField("models.User", related_name="direct_conversations_low")
    user_high = fields.ForeignKeyField("models.User", related_name="direct_conversations_high")
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "direct_conversations"
        unique_together = ("user_low", "user_high")


class DirectMessage(models.Model):
    id = fields.BigIntField(pk=True)
    conversation = fields.ForeignKeyField("models.DirectConversation", related_name="messages")
    sender = fields.ForeignKeyField("models.User", related_name="direct_messages_sent")
    receiver = fields.ForeignKeyField("models.User", related_name="direct_messages_received")

    message_type = fields.CharField(max_length=20)  # text, image, voice, emoji, sticker
    text = fields.TextField(null=True)
    media_url = fields.CharField(max_length=500, null=True)
    extra = fields.JSONField(default=dict)

    is_read = fields.BooleanField(default=False)
    read_at = fields.DatetimeField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "direct_messages"

