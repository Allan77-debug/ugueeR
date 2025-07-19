from django.db import models
from django.contrib.postgres.fields import ArrayField
from driver.models import Driver

class Route(models.Model):
    id = models.AutoField(primary_key=True)  
    driver = models.ForeignKey(
        Driver,
        on_delete=models.CASCADE,
        db_column='driver_id',
        related_name='routes' 
    )
    startLocation = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    startPointCoords = ArrayField(models.FloatField(), size=2)
    endPointCoords = ArrayField(models.FloatField(), size=2)

    class Meta:
        db_table = 'route'
