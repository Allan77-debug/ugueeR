from django.db import models

# Create your models here.
class Vechicle (models.Model):
    id = models.AutoField(primary_key=True)
    driver_id = models.IntegerField()
    plate = models.CharField(max_length=20, unique=True)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    vehicle_type = models.CharField(max_length=50)
    category = models.CharField(max_length=50)
    soat = models.DateTimeField()
    tecnomechanical = models.DateTimeField()
    capacity = models.IntegerField()
    class Meta:
        db_table = 'vehicle'
