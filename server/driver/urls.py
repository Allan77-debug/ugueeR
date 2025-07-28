# server/driver/urls.py

from django.urls import path
from .views import (
    RouteDirectionsView, 
    ReverseGeocodeView, 
    MarkTravelAsCompletedView, 
    StartTravelView
)

# Define los patrones de URL para la aplicación 'driver'.
# Cada ruta está asociada a una vista específica que manejará las peticiones.
urlpatterns = [
    # Endpoint para obtener direcciones de ruta desde un punto de inicio a un fin.
    path('route-directions/', RouteDirectionsView.as_view(), name='route-directions'),
    
    # Endpoint para obtener una dirección legible a partir de coordenadas (geocodificación inversa).
    path('reverse-geocode/', ReverseGeocodeView.as_view(), name='reverse-geocode'),
    
    # Endpoint para que un conductor marque un viaje como completado.
    path('travel/<int:travel_id>/complete/', MarkTravelAsCompletedView.as_view(), name='driver-travel-complete'),
    
    # Endpoint para que un conductor inicie un viaje previamente programado.
    path('travel/<int:travel_id>/start/', StartTravelView.as_view(), name='driver-start-travel'),
]