from django.db import models
from users.models import Users
from travel.models import Travel # Asegúrate de que esta importación sea correcta
# Ya no necesitamos CompositePrimaryKey, así que la removemos

class Realize(models.Model):
    # Añadimos el campo 'id' explícitamente como clave primaria y AutoField.
    # Esto es lo que Django hace por ti por defecto si no hay otra PK.
    id = models.AutoField(primary_key=True) 

    STATUS_CONFIRMED = 'confirmed'
    STATUS_CANCELLED = 'cancelled'
    STATUS_PENDING = 'pending'

    RESERVATION_STATUS_CHOICES = [
        (STATUS_PENDING, 'Pendiente'),
        (STATUS_CONFIRMED, 'Confirmada'),
        (STATUS_CANCELLED, 'Cancelada'),
    ]

    user = models.ForeignKey(
        Users, 
        on_delete=models.CASCADE, 
        db_column='uid', # Especifica el nombre de la columna en la DB si es diferente al nombre del campo
        related_name='realize' 
    )
    
    travel = models.ForeignKey(
        Travel, 
        on_delete=models.CASCADE, 
        db_column='id_travel', # Especifica el nombre de la columna en la DB
        related_name='realize'
    )
    
    status = models.CharField(
        max_length=20, 
        choices=RESERVATION_STATUS_CHOICES,
        default=STATUS_PENDING
    )

    class Meta:
        db_table = 'realize' # Nombre real de tu tabla en la DB
        
        # unique_together se mantiene para asegurar que un usuario no pueda reservar el mismo viaje dos veces.
        # Esto NO es la clave primaria, sino una restricción de unicidad adicional.
        unique_together = (('user', 'travel'),) 
        
        # Eliminamos 'primary_key = CompositePrimaryKey(['user', 'travel'])'

    def __str__(self):
        # Ahora puedes referenciar self.id
        return f"Reserva {self.id} de {self.user.full_name} para Viaje {self.travel.id} - Estado: {self.status}"