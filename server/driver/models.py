from django.db import models
from users.models import Users

class Driver(models.Model):
    """
    Modelo que representa el perfil de un Conductor.

    Este modelo extiende el modelo `Users` a través de una relación uno a uno,
    añadiendo información específica del conductor, como su estado de validación.
    """
    
    # Opciones para el estado de validación del conductor.
    VALIDATE_STATE_CHOICES = [
        ('pending', 'Pendiente'),   # El conductor ha solicitado serlo, pero no ha sido revisado.
        ('approved', 'Aprobado'),   # El conductor ha sido aprobado por un administrador.
        ('rejected', 'Rechazado'),  # La solicitud del conductor ha sido rechazada.
    ]
    
    # Relación uno a uno con el modelo Users. Esto significa que un usuario solo
    # puede tener un perfil de conductor, y viceversa.
    # 'primary_key=True' hace que el ID del usuario sea también el ID del conductor.
    user = models.OneToOneField(
        Users,
        on_delete=models.CASCADE,  # Si se elimina el usuario, se elimina su perfil de conductor.
        primary_key=True,
        related_name='driver',     # Permite acceder al perfil desde un objeto User: `user.driver`
        db_column='id'
    )
    
    # Campo para almacenar el estado de validación del conductor.
    validate_state = models.CharField(
        max_length=50,
        choices=VALIDATE_STATE_CHOICES,
    )
    
    # Campo de fecha y hora que se establece automáticamente al crear un nuevo conductor.
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        """
        Representación en cadena del modelo, útil en el admin de Django.
        Devuelve el nombre completo del usuario asociado.
        """
        return self.user.full_name

    class Meta:
        """
        Metadatos del modelo.
        """
        db_table = 'driver'  # Nombre de la tabla en la base de datos.
        
        # Restricciones a nivel de base de datos para garantizar la integridad de los datos.
        constraints = [
            models.CheckConstraint(
                check=models.Q(validate_state__in=['pending', 'approved', 'rejected']),
                name='validate_state_check'
            )
        ]