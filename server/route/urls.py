# server/route/urls.py

from django.urls import path
from .views import (
    RouteCreateView,
    RouteListView,
    RouteDetailView,
    RouteDeleteView,
)

# Lista de patrones de URL para la aplicación 'route'.
urlpatterns = [
    # Endpoint para que un conductor cree una nueva ruta.
    path('create/', RouteCreateView.as_view(), name='route-create'),
    
    # Endpoint para listar todas las rutas disponibles en la institución del usuario.
    path('list/', RouteListView.as_view(), name='route-list'),
    
    # Endpoint para que un conductor liste únicamente sus propias rutas.
    path('my-routes/', RouteDetailView.as_view(), name='route-my-routes'),
    
    # Endpoint para que un conductor elimine una de sus rutas por ID.
    path('<int:id>/delete/', RouteDeleteView.as_view(), name='route-delete'),
]