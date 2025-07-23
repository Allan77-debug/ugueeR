from django.urls import path
from .views import (
    RouteCreateView,
    RouteListView,
    RouteDetailView,
    RouteDeleteView,
)

urlpatterns = [
    path('create/', RouteCreateView.as_view(), name='route-create'),
    path('list/', RouteListView.as_view(), name='route-list'),
    path('my-routes/', RouteDetailView.as_view(), name='route-my-routes'),
    path('<int:id>/delete/', RouteDeleteView.as_view(), name='route-delete'),
]