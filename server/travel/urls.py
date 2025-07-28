# server/travel/urls.py
from django.urls import path
from .views import (
    DriverTravelListView,
    TravelCreateView,
    TravelDeleteView,
    InstitutionTravelListView,
    TravelRouteView
)

# Define las rutas URL para la API de la aplicación 'travel'.
urlpatterns = [
    # URL para que un conductor vea su lista de viajes con reservaciones.
    path('info/<int:driver_id>/', DriverTravelListView.as_view(), name='info-viaje-conductor'),
    
    # URL para crear un nuevo viaje.
    path('create/', TravelCreateView.as_view(), name='crear-viaje'),
    
    # URL para eliminar un viaje específico por su ID.
    path('delete/<int:id>/', TravelDeleteView.as_view(), name='eliminar-viaje'),
    
    # URL para que un usuario vea todos los viajes de su institución.
    path('institution/', InstitutionTravelListView.as_view(), name='lista-viajes-institucion'),
    
    # URL para obtener la información de la ruta de un viaje específico.
    path('route/<int:travel_id>/', TravelRouteView.as_view(), name='ruta-viaje'),
]