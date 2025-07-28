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

urlpatterns = [
    # --- Rutas Públicas / Para Admins ---
    path('register/', InstitutionCreateView.as_view(), name='institution-register'),
    path('login/', InstitutionLoginView.as_view(), name='institution-login'),
    path('list/', InstitutionListView.as_view(), name='institution-list-admin'),

    # --- Rutas Protegidas para Instituciones Autenticadas ---
    
    # Gestionar miembros de la institución
    path('users/', InstitutionUsersView.as_view(), name='institution-list-own-users'),
    path('users/<str:uid>/approve/', InstitutionApproveUser.as_view(), name='institution-approve-user'),
    path('users/<str:uid>/reject/', InstitutionRejectUser.as_view(), name='institution-reject-user'),

    # Gestionar solicitudes de conductores
    path('driver-applications/', DriverApplicationsListView.as_view(), name='institution-driver-applications'),
    path('driver-applications/<str:uid>/approve/', ApproveDriverView.as_view(), name='institution-approve-driver'),
    path('driver-applications/<str:uid>/reject/', RejectDriverView.as_view(), name='institution-reject-driver'),
]