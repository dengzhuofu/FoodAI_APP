from tortoise import fields, models

class Permission(models.Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100) # Display name e.g., "查看菜谱"
    code = fields.CharField(max_length=100, unique=True)  # e.g., "content:view"
    type = fields.CharField(max_length=20) # menu / button / api
    parent_id = fields.IntField(null=True) # For tree structure
    
    # Optional: We can add an 'order' field for sorting menu items later if needed
    # order = fields.IntField(default=0)

    class Meta:
        table = "permissions"

class Role(models.Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=50, unique=True)  # e.g., "super_admin"
    display_name = fields.CharField(max_length=50) # e.g., "超级管理员"
    description = fields.TextField(null=True)
    permissions = fields.ManyToManyField("models.Permission", related_name="roles")
    is_system = fields.BooleanField(default=False) # Cannot be deleted

    class Meta:
        table = "roles"
