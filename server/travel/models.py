# server/travel/models.py
from django.db import models
from driver.models import Driver 
from vehicle.models import Vehicle  
from route.models import Route  
from django.db.models import Q, CheckConstraint

class Travel(models.Model):
    """
    Representa un viaje en el sistema.

    Este modelo centraliza la información de un viaje, vinculando un conductor,
    un vehículo y una ruta en un momento y precio específicos. También gestiona
    el estado actual del viaje.
    """
    
    # Define las opciones permitidas para el campo `travel_state`.
    # Es una lista de tuplas, donde el primer elemento es el valor que se guarda en la BD
    # y el segundo es el nombre legible por humanos.
    TRAVEL_STATES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
        
    # Campo de ID autoincremental que actúa como clave primaria de la tabla.
    id = models.AutoField(primary_key=True)
    
    # Relación de clave foránea con el modelo Driver. Si un conductor es eliminado, sus viajes también lo serán (CASCADE).
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE)
    
    # Relación de clave foránea con el modelo Vehicle. Si un vehículo es eliminado, sus viajes también lo serán.
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    
    # Relación de clave foránea con el modelo Route. Si una ruta es eliminada, sus viajes también.
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    
    # Campo para almacenar la fecha y hora programada del viaje.
    time = models.DateTimeField()
    
    # Campo para almacenar el estado actual del viaje (ej: 'scheduled', 'in_progress').
    travel_state = models.CharField(max_length=50)
    
    # Campo para almacenar el precio del viaje como un número entero.
    price = models.IntegerField()

    class Meta:
        """
        Metadatos para el modelo Travel.
        
        Aquí se definen opciones a nivel de modelo, como el nombre de la tabla en la
        base de datos y las restricciones de integridad.
        """
        # Especifica el nombre exacto de la tabla en la base de datos.
        db_table = 'travel'
        
        # Define una lista de restricciones que se aplicarán a nivel de base de datos.
        constraints = [
            # Restricción para asegurar que el precio sea siempre mayor o igual a 0.
            CheckConstraint(check=Q(price__gte=0), name='chk_price_positive'),
            
            # Restricción para asegurar que el valor del campo `travel_state` sea uno de los permitidos.
            CheckConstraint(
                check=Q(travel_state__in=['scheduled', 'in_progress', 'completed', 'cancelled']),
                name='travel_travel_state_check'
            )
        ]