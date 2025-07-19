from django.urls import path
from .views import (
    DriverTravelListView,
    TravelCreateView,
    TravelDeleteView,
)

urlpatterns = [
    path('info/<int:driver_id>/', DriverTravelListView.as_view(), name='info'),
    path('create/', TravelCreateView.as_view(), name ='create-travel'),
    path('travel/delete/<int:id>/', TravelDeleteView.as_view(), name='travel-delete'),
] 