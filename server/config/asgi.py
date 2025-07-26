"""
ASGI config for config project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import travel.routing 

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Este es el enrutador principal
application = ProtocolTypeRouter({
  # Peticiones web normales (HTTP)
  "http": get_asgi_application(),
  # Conexiones WebSocket (WS)
  "websocket": AuthMiddlewareStack( # AuthMiddlewareStack permite usar la autenticación de Django
        URLRouter(
            travel.routing.websocket_urlpatterns
        )
    ),
})

