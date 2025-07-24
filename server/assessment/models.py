

from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from travel.models import Travel 
from driver.models import Driver    
from users.models import Users     

class Assessment(models.Model):
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
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    
    comment = models.TextField(
        blank=True, 
        null=True   
    )
    

    class Meta:
        db_table = 'assessment'
        constraints = [
            models.UniqueConstraint(
                fields=['travel', 'user'], 
                name='unique_user_travel_assessment'
            )
        ]

    def __str__(self):
        return f"Calificación de {self.user.full_name} para el viaje {self.travel.id}"