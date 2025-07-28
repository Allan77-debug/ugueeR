# server/users/apps.py
from django.apps import AppConfig

class UsersConfig(AppConfig):
    """
    Configuración de la aplicación 'users' de Django.

    Esta clase es utilizada por Django para la inicialización de la aplicación
    y sus componentes, como modelos y señales.
    """
    # Define el tipo de campo de clave primaria automática por defecto para los modelos.
    # 'BigAutoField' es un entero de 64 bits, ideal para tablas con un alto
    # volumen de registros.
    default_auto_field = 'django.db.models.BigAutoField'
    
    # El nombre de la aplicación. Debe ser único dentro del proyecto.
    name = 'users'