# server/vehicle/models.py
from django.db import models
from driver.models import Driver 

class Vehicle(models.Model):
    """
    Representa un vehículo en el sistema.

    Cada vehículo está asociado obligatoriamente a un conductor (`Driver`).
    Almacena información clave como la placa, marca, modelo y capacidad.
    """
    # Clave primaria autoincremental.
    id = models.AutoField(primary_key=True)
    
    # Relación con el modelo Driver. Un conductor puede tener múltiples vehículos.
    driver = models.ForeignKey(  
        Driver,  
        on_delete=models.CASCADE,  # Si el conductor es eliminado, sus vehículos también lo serán.
        related_name='vehicles',   # Permite acceder a los vehículos desde un conductor (ej: driver.vehicles.all()).
        db_column='driver_id'      # Nombre explícito de la columna en la base de datos.
    )
    
    # Placa del vehículo. Debe ser única para evitar duplicados.
    plate = models.CharField(max_length=20, unique=True)
    
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    vehicle_type = models.CharField(max_length=50)
    category = models.CharField(max_length=50) # Categoría del servicio (ej: 'intermunicipal').
    
    # Fechas de vencimiento de documentos importantes.
    soat = models.DateField()
    tecnomechanical = models.DateField()
    
    # Capacidad de pasajeros del vehículo.
    capacity = models.IntegerField()

    class Meta:
        """Metadatos para el modelo Vehicle."""
        # Nombre de la tabla en la base de datos.
        db_table = 'vehicle'
        # Restricciones a nivel de base de datos.
        constraints = [
            # Asegura que el valor del campo 'category' sea uno de los permitidos.
            models.CheckConstraint(
                check=models.Q(category__in=['intermunicipal', 'metropolitano', 'campus']),
                name='category_check'
            )
        ]