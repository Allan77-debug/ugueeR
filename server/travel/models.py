from django.db import models
from driver.models import Driver 
from vehicle.models import Vehicle  
from route.models import Route  


class Travel(models.Model):
    id = models.AutoField(primary_key=True)
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE)  # LLAVE FORANEA
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)  # LLAVE FORANEA
    route = models.ForeignKey(Route, on_delete=models.CASCADE)  # LLAVE FORANEA
    time = models.DateTimeField()
    travel_state = models.CharField(max_length=50)
    price = models.IntegerField()

    class Meta:
        db_table = 'travel'