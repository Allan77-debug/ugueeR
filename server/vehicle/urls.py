from django.urls import path
from .views import VehicleCreateView

urlpatterns = [
    path('vehicles/register/', VehicleCreateView.as_view(), name='vehicle-register'),
]