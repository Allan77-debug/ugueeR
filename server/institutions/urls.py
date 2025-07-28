# server/institutions/urls.py

from django.urls import path
from .views import (
    InstitutionCreateView,
    InstitutionListView,
    InstitutionApproveUser,
    InstitutionRejectUser,
    InstitutionUsersView,
    InstitutionLoginView,
    DriverApplicationsListView,
    ApproveDriverView,
    RejectDriverView,
)

# Lista de patrones de URL para la aplicación 'institutions'.
urlpatterns = [
    # --- Rutas Públicas o para Administradores Generales ---
    path('register/', InstitutionCreateView.as_view(), name='institution-register'),
    path('login/', InstitutionLoginView.as_view(), name='institution-login'),
    path('list/', InstitutionListView.as_view(), name='institution-list-admin'),

    # --- Rutas Protegidas (requieren token de institución) ---
    
    # Endpoints para gestionar los miembros (usuarios) de la institución.
    path('users/', InstitutionUsersView.as_view(), name='institution-list-own-users'),
    path('users/<str:uid>/approve/', InstitutionApproveUser.as_view(), name='institution-approve-user'),
    path('users/<str:uid>/reject/', InstitutionRejectUser.as_view(), name='institution-reject-user'),

    # Endpoints para gestionar las solicitudes de conductor.
    path('driver-applications/', DriverApplicationsListView.as_view(), name='institution-driver-applications'),
    path('driver-applications/<str:uid>/approve/', ApproveDriverView.as_view(), name='institution-approve-driver'),
    path('driver-applications/<str:uid>/reject/', RejectDriverView.as_view(), name='institution-reject-driver'),
]