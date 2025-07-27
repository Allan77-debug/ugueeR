# realize/urls.py
from django.urls import path
from .views import UserRealizeListView, RealizeCreateView, RealizeCancelView

urlpatterns = [
    path('create/', RealizeCreateView.as_view(), name='realize-create'),
    path('my-reservations/', UserRealizeListView.as_view(), name='realize-list-my'),
    
    # URL para CANCELAR una reserva específica usando su ID autogenerado (pk)
    # Ejemplo: PATCH /api/realize/cancel/123/
    path('cancel/<int:pk>/', RealizeCancelView.as_view(), name='realize-cancel'),
]