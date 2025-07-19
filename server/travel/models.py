from django.db import models
from driver.models import Driver 
from vehicle.models import Vehicle  
from route.models import Route  
from django.db.models import Q, CheckConstraint

class Travel(models.Model):
    TRAVEL_STATES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
        
    id = models.AutoField(primary_key=True)
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE)  # LLAVE FORANEA
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)  # LLAVE FORANEA
    route = models.ForeignKey(Route, on_delete=models.CASCADE)  # LLAVE FORANEA
    time = models.DateTimeField()
    travel_state = models.CharField(max_length=50)
    price = models.IntegerField()

    class Meta:
        db_table = 'travel'
        constraints = [
            # Price must be >= 0
            CheckConstraint(check=Q(price__gte=0), name='chk_price_positive'),
            
            # travel_state must be one of allowed values
            CheckConstraint(
                check=Q(travel_state__in=['scheduled', 'in_progress', 'completed', 'cancelled']),
                name='travel_travel_state_check'
            )
        ]