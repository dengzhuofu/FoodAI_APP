from tortoise import fields, models

class FridgeItem(models.Model):
    id = fields.BigIntField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="fridge_items")
    name = fields.CharField(max_length=50)
    category = fields.CharField(max_length=20, null=True)
    quantity = fields.CharField(max_length=20, null=True)
    icon = fields.CharField(max_length=10, null=True)
    expiry_date = fields.DateField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "fridge_items"

class ShoppingItem(models.Model):
    id = fields.BigIntField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="shopping_items")
    name = fields.CharField(max_length=50)
    category = fields.CharField(max_length=20, null=True)
    is_bought = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "shopping_items"
