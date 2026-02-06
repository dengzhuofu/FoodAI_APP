from tortoise import fields, models

class HealthProfile(models.Model):
    id = fields.IntField(pk=True)
    user = fields.OneToOneField("models.User", related_name="health_profile", on_delete=fields.CASCADE)
    height = fields.FloatField(description="Height in cm")
    weight = fields.FloatField(description="Weight in kg")
    daily_calorie_target = fields.IntField(null=True)
    dietary_advice = fields.TextField(null=True)
    exercise_advice = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "health_profiles"

class DailyCheckIn(models.Model):
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="daily_checkins", on_delete=fields.CASCADE)
    date = fields.DateField()
    breakfast_content = fields.TextField(null=True)
    lunch_content = fields.TextField(null=True)
    dinner_content = fields.TextField(null=True)
    exercise_content = fields.TextField(null=True)
    
    total_calories_in = fields.IntField(default=0)
    total_calories_burned = fields.IntField(default=0)
    
    status = fields.CharField(max_length=20, default="white") # white, orange, red
    
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "daily_checkins"
        unique_together = ("user", "date")
