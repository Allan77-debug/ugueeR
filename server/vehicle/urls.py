#vehicle/urls.py
# server/vehicle/urls.py
from django.urls import path
from .views import VehicleCreateView, VehicleListByDriver, VehicleDeleteView, VehicleDetailView

# Define las rutas URL para la API de la aplicación 'vehicle'.
urlpatterns = [
    # Endpoint para registrar un nuevo vehículo.
    path('register/', VehicleCreateView.as_view(), name='registrar-vehiculo'),
    
    # Endpoint para que un conductor liste sus propios vehículos.
    path('my-vehicles/', VehicleListByDriver.as_view(), name='listar-mis-vehiculos'),
    
    # Endpoint para ver los detalles de un vehículo específico por su ID.
    path('<int:vehicle_id>/', VehicleDetailView.as_view(), name='detalle-vehiculo'),
    
    # Endpoint para que un conductor elimine uno de sus vehículos por ID.
    path('<int:vehicle_id>/delete/', VehicleDeleteView.as_view(), name='eliminar-vehiculo'),
]