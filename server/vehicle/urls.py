from django.urls import path
from .views import VehicleCreateView, VehicleListByDriver, VehicleDeleteView, VehicleDetailView

urlpatterns = [
    path('vehicles/register/', VehicleCreateView.as_view(), name='vehicle-register'),
    path('my-vehicles/', VehicleListByDriver.as_view(), name='vehicle-list'),
    path('vehicles/<int:vehicle_id>/', VehicleDetailView.as_view(), name='vehicle-detail'),
    path('<int:vehicle_id>/delete/', VehicleDeleteView.as_view(), name='vehicle-delete'),
]