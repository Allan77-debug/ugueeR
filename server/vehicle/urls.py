from django.urls import path
from .views import VehicleCreateView, VehicleListByDriver, VehicleDeleteView

urlpatterns = [
    path('vehicles/register/', VehicleCreateView.as_view(), name='vehicle-register'),
    path('my-vehicles/', VehicleListByDriver.as_view(), name='vehicle-list'),
    path('<int:vehicle_id>/delete/', VehicleDeleteView.as_view(), name='vehicle-delete'),
]