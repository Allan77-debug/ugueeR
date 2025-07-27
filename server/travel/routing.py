from django.urls import path
from .consumers import LocationConsumer, InstitutionMapConsumer

websocket_urlpatterns = [
    path('ws/travel/<str:travel_id>/', LocationConsumer.as_asgi()),

    path('ws/institution/live_map/', InstitutionMapConsumer.as_asgi()),
]