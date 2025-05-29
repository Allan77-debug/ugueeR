from django.db import models
from users.models import Users

class Driver(models.Model):
    VALIDATE_STATE_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    user = models.OneToOneField(
        Users,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='driver',
        db_column='id'
    )
    validate_state = models.CharField(
        max_length=50,
        choices=VALIDATE_STATE_CHOICES,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'driver'
        constraints = [
            models.CheckConstraint(
                check=models.Q(validate_state__in=['pending', 'approved', 'rejected']),
                name='validate_state_check'
            )
        ]