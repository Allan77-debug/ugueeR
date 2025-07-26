# server/travel/routing.py
from django.urls import path
from .consumers import LocationConsumer

websocket_urlpatterns = [
    # Esta URL aceptará conexiones WebSocket
    path('ws/travel/<str:travel_id>/', LocationConsumer.as_asgi()),
]