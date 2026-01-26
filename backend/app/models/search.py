from tortoise import fields, models

class SearchHistory(models.Model):
    id = fields.BigIntField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="search_history", on_delete=fields.CASCADE, null=True)
    keyword = fields.CharField(max_length=100)
    count = fields.IntField(default=1)
    last_searched_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "search_history"
        # 允许匿名搜索记录？通常只记录登录用户。如果不登录，前端本地存储即可。
        # 这里设计为 user 可为 null (虽然通常我们会过滤)，或者我们只给登录用户存后端。
