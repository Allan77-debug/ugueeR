from django.apps import AppConfig

class TravelConfig(AppConfig):
    """
    Configuración de la aplicación 'travel' de Django.

    Esta clase define la configuración específica para la aplicación 'travel'.
    Django la utiliza para inicializar la aplicación y sus componentes.
    """
    # Define el tipo de campo de clave primaria automática por defecto para los modelos de esta aplicación.
    # BigAutoField es un entero de 64 bits, adecuado para un gran número de registros.
    default_auto_field = 'django.db.models.BigAutoField'
    
    # El nombre de la aplicación. Debe ser único dentro del proyecto Django.
    name = 'travel'

    def ready(self):
        """
        Este método se ejecuta tan pronto como el registro de aplicaciones está poblado.
        Es el lugar ideal para importar y conectar señales.
        """
        # Importa el módulo de señales de la aplicación 'travel' para asegurar que
        # los manejadores de señales (signal handlers) se registren correctamente.
        import travel.signals