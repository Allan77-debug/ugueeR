from django.db import models

class Driver(models.Model):
    id = models.AutoField(primary_key=True)
    validate_state = models.CharField(max_length=50)
    created_at = models.DateTimeField

    class Meta:
        db_table = 'driver'

