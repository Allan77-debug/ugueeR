# server/institutions/apps.py

from django.apps import AppConfig

class InstitutionsConfig(AppConfig):
    """
    Clase de configuración para la aplicación 'institutions' de Django.
    Django la utiliza para identificar la aplicación y sus ajustes básicos.
    """
    # Define el tipo de campo de clave primaria por defecto para los modelos de esta app.
    default_auto_field = 'django.db.models.BigAutoField'
    
    # El nombre de la aplicación.
    name = 'institutions'