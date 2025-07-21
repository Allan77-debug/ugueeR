from django.db import models
from driver.models import Driver 

class Vehicle (models.Model):
    id = models.AutoField(primary_key=True)
    driver = models.ForeignKey(  
        Driver,  
        on_delete=models.CASCADE,  
        related_name='vehicles',  
        db_column='driver_id'  
    )
    plate = models.CharField(max_length=20, unique=True)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    vehicle_type = models.CharField(max_length=50)
    category = models.CharField(max_length=50)
    soat = models.DateField()
    tecnomechanical = models.DateField()
    capacity = models.IntegerField()
    class Meta:
        db_table = 'vehicle'
        constraints = [
            models.CheckConstraint(
                check=models.Q(category__in=['intermunicipal', 'metropolitano', 'campus']),
                name='category_check'
            )
        ]