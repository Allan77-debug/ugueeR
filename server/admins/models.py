"""
Define el modelo de datos para la aplicación 'admins'.

Este archivo contiene la definición del modelo 'AdminUser', que representa a un
usuario administrador en el sistema.
"""
from django.db import models

class AdminUser(models.Model):
    """
    Representa a un usuario administrador del sistema.
    
    Esta tabla no es gestionada por las migraciones de Django (`managed = False`),
    lo que significa que su creación y modificación se realiza directamente
    en la base de datos.
    
    Atributos:
        aid (AutoField): La clave primaria única para el administrador.
        aemail (EmailField): El correo electrónico único del administrador, usado para el login.
        apassword (TextField): La contraseña del administrador (se espera que esté hasheada).
        full_name (CharField): El nombre completo del administrador (opcional).
        created_at (DateTimeField): La fecha y hora de creación del registro, añadida automáticamente.
    """
    aid = models.AutoField(primary_key=True)
    aemail = models.EmailField(unique=True)
    apassword = models.TextField()
    full_name = models.CharField(max_length=150, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Opciones de metadatos para el modelo AdminUser."""
        # Define el nombre exacto de la tabla en la base de datos.
        db_table = "admin_user"
        # Indica a Django que no gestione el ciclo de vida de esta tabla (creación, modificación, etc.).
        managed = False 

    def __str__(self):
        """
        Representación en cadena de una instancia del modelo.
        
        Devuelve:
            str: El correo electrónico del administrador.
        """ 
        return self.aemail