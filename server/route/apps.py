# server/route/apps.py

from django.apps import AppConfig

# El nombre de la clase aquí es 'TrouteConfig', aunque la app se llame 'route'.
# Esto es válido, pero por convención se suele llamar 'RouteConfig'.
class TrouteConfig(AppConfig):
    """
    Clase de configuración para la aplicación 'route' de Django.
    """
    # Define el tipo de campo de clave primaria por defecto para los modelos de esta app.
    default_auto_field = 'django.db.models.BigAutoField'
    
    # El nombre de la aplicación.
    name = 'route'