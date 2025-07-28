# server/realize/models.py

from django.db import models
from users.models import Users
from travel.models import Travel

class Realize(models.Model):
    """
    Representa la acción de un usuario realizando una reserva para un viaje.
    Este modelo conecta a un Usuario con un Viaje específico.
    """
    # Clave primaria autoincremental, gestionada por Django.
    id = models.AutoField(primary_key=True) 

    # Define las opciones posibles para el estado de una reserva.
    STATUS_CONFIRMED = 'confirmed'
    STATUS_CANCELLED = 'cancelled'
    STATUS_PENDING = 'pending'
    RESERVATION_STATUS_CHOICES = [
        (STATUS_PENDING, 'Pendiente'),
        (STATUS_CONFIRMED, 'Confirmada'),
        (STATUS_CANCELLED, 'Cancelada'),
    ]

    # Relación con el usuario que hace la reserva.
    user = models.ForeignKey(
        Users, 
        on_delete=models.CASCADE, 
        db_column='uid',
        related_name='realize' 
    )
    
    # Relación con el viaje que está siendo reservado.
    travel = models.ForeignKey(
        Travel, 
        on_delete=models.CASCADE, 
        db_column='id_travel',
        related_name='realize'
    )
    
    # Campo para almacenar el estado de la reserva.
    # Por defecto, todas las nuevas reservas comienzan como 'pending'.
    status = models.CharField(
        max_length=20, 
        choices=RESERVATION_STATUS_CHOICES,
        default=STATUS_PENDING
    )

    class Meta:
        """Metadatos del modelo."""
        db_table = 'realize'
        # Restricción para asegurar que un usuario no pueda reservar el mismo viaje más de una vez.
        unique_together = (('user', 'travel'),) 

    def __str__(self):
        """Representación en cadena del objeto."""
        return f"Reserva {self.id} de {self.user.full_name} para Viaje {self.travel.id} - Estado: {self.status}"