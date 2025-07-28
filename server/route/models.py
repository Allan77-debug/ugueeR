# server/route/models.py

from django.db import models
from django.contrib.postgres.fields import ArrayField
from driver.models import Driver

class Route(models.Model):
    """
    Representa una ruta predefinida creada por un conductor.
    
    Contiene la información de origen y destino, tanto en texto legible
    como en coordenadas geográficas.
    """
    id = models.AutoField(primary_key=True)
    
    # Relación con el conductor que creó y es dueño de esta ruta.
    driver = models.ForeignKey(
        Driver,
        on_delete=models.CASCADE, # Si se elimina el conductor, se eliminan sus rutas.
        db_column='driver_id',
        related_name='routes' # Permite acceder a las rutas desde un objeto Driver (ej: `mi_conductor.routes.all()`).
    )
    
    # Nombres legibles para el origen y destino.
    startLocation = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    
    # Coordenadas [latitud, longitud] para el punto de inicio.
    # ArrayField es específico de PostgreSQL.
    startPointCoords = ArrayField(models.FloatField(), size=2)
    
    # Coordenadas [latitud, longitud] para el punto de destino.
    endPointCoords = ArrayField(models.FloatField(), size=2)

    def __str__(self):
        """Representación en cadena del objeto."""
        return f"Ruta {self.id}: de {self.startLocation} a {self.destination} (Conductor: {self.driver.user.full_name})"

    class Meta:
        """Metadatos del modelo."""
        db_table = 'route' # Nombre de la tabla en la base de datos.