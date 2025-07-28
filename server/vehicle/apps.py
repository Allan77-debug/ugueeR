# server/vehicle/apps.py
from django.apps import AppConfig

class VehicleConfig(AppConfig):
    """
    Configuración de la aplicación 'vehicle' de Django.

    Esta clase es utilizada por Django para la inicialización de la aplicación
    y sus componentes.
    """
    # Define el tipo de campo de clave primaria automática por defecto para los modelos de esta app.
    # 'BigAutoField' es un entero de 64 bits, adecuado para tablas con potencial de crecimiento.
    default_auto_field = 'django.db.models.BigAutoField'
    
    # El nombre de la aplicación. Debe ser único dentro del proyecto.
    name = 'vehicle'