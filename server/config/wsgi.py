# server/config/wsgi.py

"""
Configuración WSGI (Web Server Gateway Interface) para el proyecto.

Este archivo expone el objeto 'application' que los servidores web síncronos
(como Gunicorn o uWSGI en modo síncrono) usan para comunicarse con la aplicación Django.

Para la funcionalidad de WebSockets (asíncrona), el punto de entrada es 'asgi.py'.
"""

import os

from django.core.wsgi import get_wsgi_application

# Apunta a la configuración de Django.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Crea la aplicación WSGI.
application = get_wsgi_application()