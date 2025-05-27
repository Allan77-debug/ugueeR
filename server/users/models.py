from django.db import models


class Users(models.Model):

    STATE_PENDING = 'pendiente'
    STATE_APPROVED = 'aprobado'
    STATE_REJECTED = 'rechazado'
    USER_STATE_CHOICES = [
        (STATE_PENDING, 'Pendiente'),
        (STATE_APPROVED, 'Aprobado'),
        (STATE_REJECTED, 'Rechazado'),
    ]

    TYPE_ADMIN = 'admin'
    TYPE_DRIVER = 'driver'
    TYPE_STUDENT = 'student'
    TYPE_EMPLOYEE = 'employee'
    TYPE_TEACHER = 'teacher'
    USER_TYPE_CHOICES = [
    (TYPE_ADMIN, 'Administrador'),
    (TYPE_DRIVER, 'Conductor/a'),    
    (TYPE_STUDENT,'Estudiante'),
    (TYPE_EMPLOYEE, 'Empleado/a'),
    (TYPE_TEACHER, 'Profesor/a'),
    ]    

    uid = models.AutoField(primary_key=True)
    full_name = models.CharField(max_length=255)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)

    institutional_mail = models.EmailField()
    student_code = models.CharField(max_length=100)
    udocument = models.CharField(max_length=50)
    institutional_carne = models.ImageField(upload_to='carne/', null=True, blank=True)
    direction = models.TextField()
    uphone = models.CharField(max_length=50)
    upassword = models.CharField(max_length=255)
    institution = models.ForeignKey(
        'institutions.Institution',   # String reference to your Institution model
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='members',       # Allows institution_instance.members.all()
        db_column='institution_id'    # Tells Django this field uses the DB column named 'institution_id'
    )
    user_state = models.CharField(
        max_length=50,
        choices=USER_STATE_CHOICES,
        default=STATE_PENDING  # Default to 'pendiente' when a new user is created
    )
    
    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.full_name
