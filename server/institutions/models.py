from django.db import models

class Institution(models.Model):
    """
    Representa a una institución educativa en el sistema.
    Contiene toda la información relevante de una institución, desde su
    identificación hasta su estado de validación.
    """
    # --- Campos de Identificación y Contacto ---
    id_institution = models.AutoField(primary_key=True)
    official_name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=50, unique=True)
    ipassword = models.CharField(max_length=128) # Contraseña para el login de la institución.

    # --- Campos de Ubicación y Apariencia ---
    address = models.TextField()
    city = models.CharField(max_length=100)
    istate = models.CharField(max_length=100) # 'istate' se refiere al estado/departamento.
    postal_code = models.CharField(max_length=20)
    logo = models.ImageField(upload_to='logos/', null=True, blank=True)
    primary_color = models.CharField(max_length=7, default="#6a5acd")
    secondary_color = models.CharField(max_length=7, default="#ffffff")

    # --- Campos para el Proceso de Validación y Aprobación ---
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
    rejection_reason = models.TextField(blank=True, null=True) # Razón si la solicitud es rechazada.
    application_date = models.DateTimeField(auto_now_add=True) # Fecha de creación de la solicitud.

    class Meta:
        """Metadatos del modelo."""
        db_table = 'institution' # Nombre de la tabla en la base de datos.

    def __str__(self):
        """
        Representación en cadena del objeto, usada en el admin y en depuración.
        Devuelve el nombre oficial de la institución.
        """
        return self.official_name