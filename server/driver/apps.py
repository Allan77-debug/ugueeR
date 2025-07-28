from django.apps import AppConfig

class DriverConfig(AppConfig):
    """
    Configuración para la aplicación 'driver' de Django.

    Este archivo permite a Django conocer la existencia de la aplicación y su configuración,
    como el tipo de campo de clave primaria por defecto y el nombre de la app.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'driver'