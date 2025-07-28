# server/realize/urls.py

from django.urls import path
from .views import UserRealizeListView, RealizeCreateView, RealizeCancelView, RealizeConfirmView

urlpatterns = [
    # Endpoint para que un usuario cree una nueva reserva.
    path('create/', RealizeCreateView.as_view(), name='realize-create'),
    
    # Endpoint para que un usuario vea sus propias reservas.
    path('my-reservations/', UserRealizeListView.as_view(), name='realize-list-my'),
    
    # Endpoint para que un usuario cancele una de sus reservas.
    path('cancel/<int:pk>/', RealizeCancelView.as_view(), name='realize-cancel'),

    # Endpoint para que un usuario confirme una de sus reservas.
    path('confirm/<int:realize_id>/', RealizeConfirmView.as_view(), name='realize-confirm'),
]