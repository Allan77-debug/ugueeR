# server/driver/urls.py

from django.urls import path
from .views import RouteDirectionsView, ReverseGeocodeView, MarkTravelAsCompletedView

urlpatterns = [
    # Este endpoint recibirá las coordenadas y devolverá la ruta de Google Maps
    path('route-directions/', RouteDirectionsView.as_view(), name='route-directions'),
    path('reverse-geocode/', ReverseGeocodeView.as_view(), name='reverse-geocode'),
    path('travel/<int:travel_id>/complete/', MarkTravelAsCompletedView.as_view(), name='driver-travel-complete'),
]