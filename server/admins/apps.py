"""
Configuración de la aplicación 'admins' de Django.

Este archivo define la configuración específica para la aplicación 'admins', 
permitiendo que Django la reconozca y la integre correctamente en el proyecto.
"""
from django.apps import AppConfig


class AdminsConfig(AppConfig):
    """
    Clase de configuración para la aplicación 'admins'.
    
    Atributos:
        default_auto_field (str): Define el tipo de clave primaria automática a usar para los modelos.
        name (str): El nombre de la aplicación.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'admins'