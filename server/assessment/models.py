"""
Define el modelo de datos para la aplicación 'assessment' (calificaciones).

Este archivo contiene la definición del modelo 'Assessment', que representa la
calificación y comentario que un usuario otorga a un conductor sobre un viaje específico.
"""
from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from travel.models import Travel 
from driver.models import Driver    
from users.models import Users     

class Assessment(models.Model):
    """
    Representa una calificación (valoración) realizada por un usuario sobre un viaje.
    
    Atributos:
        travel (ForeignKey): El viaje que está siendo calificado.
        driver (ForeignKey): El conductor que realizó el viaje y recibe la calificación.
        user (ForeignKey): El usuario que emite la calificación.
        score (SmallIntegerField): La puntuación numérica, restringida entre 1 y 5.
        comment (TextField): Un comentario de texto opcional sobre la experiencia.
    """
    travel = models.ForeignKey(
        Travel,
        on_delete=models.CASCADE,
        db_column='travel_id', 
        related_name='assessments'
    )
    
    driver = models.ForeignKey(
        Driver,
        on_delete=models.CASCADE,
        db_column='driver_id', 
        related_name='assessments'
    )
    
    user = models.ForeignKey(
        Users,
        on_delete=models.CASCADE, 
        db_column='user_id', 
        related_name='assessments_given'
    )

    score = models.SmallIntegerField(
        # Valida que la puntuación esté en el rango de 1 a 5 a nivel de modelo.
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    
    comment = models.TextField(
        blank=True, # El campo puede estar vacío.
        null=True   # El campo puede ser nulo en la base de datos.
    )
    
    class Meta:
        """Opciones de metadatos para el modelo Assessment."""
        # Nombre de la tabla en la base de datos.
        db_table = 'assessment'
        # Define restricciones a nivel de base de datos.
        constraints = [
            # Asegura que un usuario solo pueda calificar un viaje una única vez.
            models.UniqueConstraint(
                fields=['travel', 'user'], 
                name='unique_user_travel_assessment'
            )
        ]

    def __str__(self):
        """
        Representación en cadena de una instancia del modelo.
        
        Devuelve:
            str: Una descripción legible de la calificación.
        """
        return f"Calificación de {self.user.full_name} para el viaje {self.travel.id}"