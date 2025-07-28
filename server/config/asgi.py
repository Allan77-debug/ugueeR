# server/config/asgi.py

import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

# --- PASO 1: ESTABLECER LA CONFIGURACIÓN DE DJANGO PRIMERO ---
# Es crucial definir qué archivo de 'settings' usar ANTES de importar
# cualquier otra parte de Django que dependa de la configuración.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# --- PASO 2: INICIALIZAR DJANGO ---
# Esta llamada carga los modelos, apps y toda la configuración de Django.
# Debe hacerse después de setdefault y antes de importar cualquier módulo del proyecto.
django.setup()

# --- PASO 3: IMPORTAR MIDDLEWARE DESPUÉS DE LA INICIALIZACIÓN ---
# Ahora que Django está configurado, podemos importar nuestro middleware personalizado.
from config.middleware import JWTAuthMiddleware 

# --- PASO 4: IMPORTAR RUTAS DE CHANNELS ---
# Importamos las rutas de WebSocket definidas en nuestra app 'travel'.
import travel.routing

# --- PASO 5: CONSTRUIR LA APLICACIÓN ASGI FINAL ---
# ProtocolTypeRouter permite a Channels desviar el tráfico según el protocolo.
application = ProtocolTypeRouter({
    
    # Para tráfico HTTP normal, usamos la aplicación WSGI estándar de Django.
    "http": get_asgi_application(),
    
    # Para tráfico WebSocket, definimos una pila de procesamiento:
    "websocket": JWTAuthMiddleware(  # 1. Primero, el middleware intercepta la conexión para autenticar.
        URLRouter(                   # 2. Luego, el URLRouter dirige la conexión al consumer correcto.
            travel.routing.websocket_urlpatterns
        )
    ),
})