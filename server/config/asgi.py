# server/config/asgi.py

import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

# 1. ESTABLECER LA CONFIGURACIÓN PRIMERO
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# 2. LLAMAR A DJANGO.SETUP() INMEDIATAMENTE DESPUÉS
django.setup()

# 3. IMPORTAR EL NUEVO MIDDLEWARE DE AUTENTICACIÓN
from config.middleware import JWTAuthMiddleware # <-- Importa tu middleware aquí

# 4. IMPORTAR LOS MÓDULOS DE CHANNELS/ROUTING DESPUÉS DE LA CONFIGURACIÓN
import travel.routing

# 5. CONSTRUIR LA APLICACIÓN FINAL
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    # Aplica tu JWTAuthMiddleware directamente al URLRouter
    "websocket": JWTAuthMiddleware(
        URLRouter(
            travel.routing.websocket_urlpatterns
        )
    ),
})