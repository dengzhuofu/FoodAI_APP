from tortoise import fields, models

class User(models.Model):
    id = fields.BigIntField(pk=True)
    username = fields.CharField(max_length=50, unique=True)
    email = fields.CharField(max_length=100, unique=True, null=True)
    password_hash = fields.CharField(max_length=255)
    nickname = fields.CharField(max_length=50)
    avatar = fields.CharField(max_length=255, null=True)
    bio = fields.TextField(null=True)
    is_pro = fields.BooleanField(default=False)
    roles = fields.ManyToManyField("models.Role", related_name="users")
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        # table = "users"
        table = "users"


class UserProfile(models.Model):
    user = fields.OneToOneField("models.User", related_name="profile", on_delete=fields.CASCADE)
    preferences = fields.JSONField(default=list)
    allergies = fields.JSONField(default=list)
    health_goals = fields.JSONField(default=list)
    settings = fields.JSONField(default=dict)

    class Meta:
        table = "user_profiles"

class Follow(models.Model):
    id = fields.IntField(pk=True)
    follower = fields.ForeignKeyField("models.User", related_name="following")
    following = fields.ForeignKeyField("models.User", related_name="followers")
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "follows"
        unique_together = ("follower", "following")

class WhatToEatPreset(models.Model):
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="what_to_eat_presets", on_delete=fields.CASCADE)
    name = fields.CharField(max_length=50)
    options = fields.JSONField()  # List of strings
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "what_to_eat_presets"

class ShoppingItem(models.Model):
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="shopping_list", on_delete=fields.CASCADE)
    name = fields.CharField(max_length=100)
    amount = fields.CharField(max_length=50, null=True)
    is_checked = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "shopping_items"

class UserIntegration(models.Model):
    id = fields.IntField(pk=True)
    user = fields.OneToOneField("models.User", related_name="integration", on_delete=fields.CASCADE)
    mcdonalds_token = fields.CharField(max_length=255, null=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "user_integrations"
