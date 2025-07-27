from django.urls import path
# Importamos el consumer que creamos en el archivo consumers.py
from .consumers import LocationConsumer 

# Esta lista contiene todas las "rutas" de WebSocket para esta app.
websocket_urlpatterns = [
    # Esta línea le dice a Channels:
    # "Cuando llegue una conexión a la URL 'ws/travel/ID_DEL_VIAJE/',
    # entrégasela a la clase LocationConsumer para que la maneje."
    path('ws/travel/<str:travel_id>/', LocationConsumer.as_asgi()),
]