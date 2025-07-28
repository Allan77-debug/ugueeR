# server/users/models.py
from django.db import models

class Users(models.Model):
    """
    Representa a un usuario en el sistema.

    Este modelo almacena toda la información fundamental de un usuario, incluyendo
    su tipo, estado de validación, información personal y la institución a la que
    pertenece. Es la tabla central para la gestión de identidades.
    """

    # --- Opciones para el estado general del usuario ---
    STATE_PENDING = 'pendiente'
    STATE_APPROVED = 'aprobado'
    STATE_REJECTED = 'rechazado'
    USER_STATE_CHOICES = [
        (STATE_PENDING, 'Pendiente'),
        (STATE_APPROVED, 'Aprobado'),
        (STATE_REJECTED, 'Rechazado'),
    ]

    # --- Opciones para el estado de la solicitud de conductor ---
    DRIVER_STATE_NONE = 'ninguno'
    DRIVER_STATE_APPROVED = 'aprobado'
    DRIVER_STATE_REJECTED = 'rechazado'
    DRIVER_STATE_PENDING = 'pendiente'
    DRIVER_STATE_CHOICES = [
        (DRIVER_STATE_NONE, 'Ninguno'),
        (DRIVER_STATE_APPROVED, 'Aprobado'),
        (DRIVER_STATE_REJECTED, 'Rechazado'),
        (DRIVER_STATE_PENDING, 'Pendiente'),
    ]

    # --- Opciones para el tipo de usuario ---
    TYPE_ADMIN = 'admin'
    TYPE_DRIVER = 'driver'
    TYPE_STUDENT = 'student'
    TYPE_EMPLOYEE = 'employee'
    TYPE_TEACHER = 'teacher'
    USER_TYPE_CHOICES = [
        (TYPE_ADMIN, 'Administrador'),
        (TYPE_DRIVER, 'Conductor/a'),    
        (TYPE_STUDENT, 'Estudiante'),
        (TYPE_EMPLOYEE, 'Empleado/a'),
        (TYPE_TEACHER, 'Profesor/a'),
    ]    

    # --- Campos del Modelo ---
    uid = models.AutoField(primary_key=True)
    full_name = models.CharField(max_length=255)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)

    institutional_mail = models.EmailField(unique=True) # Es buena práctica que el email sea único.
    student_code = models.CharField(max_length=100)
    udocument = models.CharField(max_length=50)
    institutional_carne = models.ImageField(upload_to='carne/', null=True, blank=True)
    direction = models.TextField()
    uphone = models.CharField(max_length=50)
    upassword = models.CharField(max_length=255) # Almacena la contraseña hasheada.

    # Relación con el modelo Institution
    institution = models.ForeignKey(
        'institutions.Institution',   # Referencia al modelo Institution en la app 'institutions'.
        on_delete=models.SET_NULL,    # Si la institución se elimina, este campo se pondrá a NULL.
        null=True,                    # Permite valores nulos en la BD.
        blank=True,                   # Permite que el campo esté vacío en los formularios.
        related_name='members',       # Permite acceder a los usuarios desde una instancia de institución (ej: institucion.members.all()).
        db_column='institution_id'    # Especifica el nombre de la columna en la base de datos.
    )
    
    user_state = models.CharField(
        max_length=50,
        choices=USER_STATE_CHOICES,
        default=STATE_PENDING  # Por defecto, un usuario nuevo está pendiente de aprobación.
    )

    driver_state = models.CharField(
        max_length=50,
        choices=DRIVER_STATE_CHOICES, # Es buena práctica asociar las choices aquí también.
        default=DRIVER_STATE_NONE  # Por defecto, un usuario no es conductor.
    )
    
    class Meta:
        """Metadatos para el modelo Users."""
        db_table = 'users' # Nombre de la tabla en la base de datos.

    def __str__(self):
        """
        Representación en cadena del objeto.
        Devuelve el nombre completo del usuario, útil en el panel de administración de Django.
        """
        return self.full_name