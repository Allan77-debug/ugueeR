from django.urls import path
from .views import (
    DriverTravelListView,
    TravelCreateView,
    TravelDeleteView,
    InstitutionTravelListView,
    TravelRouteView
)

urlpatterns = [
    path('info/<int:driver_id>/', DriverTravelListView.as_view(), name='info'),
    path('create/', TravelCreateView.as_view(), name ='create-travel'),
    path('travel/delete/<int:id>/', TravelDeleteView.as_view(), name='travel-delete'),
    path('institution/', InstitutionTravelListView.as_view(), name='institution-travel-list'),
    path('route/<int:travel_id>/', TravelRouteView.as_view(), name='travel-route'),
] 