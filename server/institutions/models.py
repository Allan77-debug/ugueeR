from django.db import models

# Create your models here.
class Institution(models.Model):
    id_institution = models.AutoField(primary_key=True)

    official_name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=50, unique=True)
    address = models.TextField()
    city = models.CharField(max_length=100)
    istate = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    logo = models.ImageField(upload_to='logos/', null=True, blank=True)
    primary_color = models.CharField(max_length=7, default="#6a5acd")
    secondary_color = models.CharField(max_length=7, default="#ffffff")
    ipassword = models.CharField(max_length=128)

    # Campos para validación
    validate_state = models.BooleanField(default=False)
    status = models.CharField(
        max_length=10,
        choices=[
            ('pendiente', 'Pendiente'),
            ('aprobada', 'Aprobada'),
            ('rechazada', 'Rechazada')
        ],
        default='pendiente'
    )
    rejection_reason = models.TextField(blank=True, null=True)
    application_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'institution'

    def __str__(self):
        return self.official_name
