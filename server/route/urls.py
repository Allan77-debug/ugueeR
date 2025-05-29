from django.urls import path
from .views import RouteCreateView

urlpatterns = [
    path('create/', RouteCreateView.as_view(), name='route-create'),
]