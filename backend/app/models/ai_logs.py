from tortoise import fields, models

class AILog(models.Model):
    id = fields.BigIntField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="ai_logs")
    feature = fields.CharField(max_length=50)
    input_summary = fields.TextField(null=True)
    output_result = fields.JSONField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "ai_logs"
