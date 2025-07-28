# server/travel/routing.py
from django.urls import path
from .consumers import LocationConsumer, InstitutionMapConsumer

# Define las rutas de WebSocket para la aplicación 'travel'.
# Django Channels utilizará esta lista para dirigir las conexiones entrantes
# de WebSocket al consumer apropiado.
websocket_urlpatterns = [
    # Ruta para que un cliente (conductor, pasajero, admin) se conecte a un viaje específico.
    # El `travel_id` se pasa como un argumento a LocationConsumer.
    path('ws/travel/<int:travel_id>/', LocationConsumer.as_asgi()),

    # Ruta para que un cliente (mapa institucional) se conecte para ver todos los viajes activos.
    path('ws/institution/live_map/', InstitutionMapConsumer.as_asgi()),
]