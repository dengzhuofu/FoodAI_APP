from tortoise import fields, models

class ChatSession(models.Model):
    id = fields.BigIntField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="chat_sessions")
    title = fields.CharField(max_length=100, default="新对话")
    agent_id = fields.CharField(max_length=50, default="kitchen_agent") # For different presets
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "chat_sessions"

class ChatMessage(models.Model):
    id = fields.BigIntField(pk=True)
    session = fields.ForeignKeyField("models.ChatSession", related_name="messages")
    role = fields.CharField(max_length=20) # user, assistant, system
    content = fields.TextField()
    thoughts = fields.JSONField(null=True) # Store agent thoughts
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "chat_messages"

class AgentPreset(models.Model):
    id = fields.BigIntField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="agent_presets", null=True) # null means system preset
    name = fields.CharField(max_length=100)
    description = fields.TextField(null=True)
    system_prompt = fields.TextField()
    allowed_tools = fields.JSONField(default=[]) # List of tool names
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "agent_presets"
