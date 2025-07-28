"""
Define las rutas de la API para la aplicación 'admins'.

Este archivo mapea las URLs a las vistas correspondientes, creando los endpoints
que el frontend consumirá para las operaciones de administración.
"""
from django.urls import path
from .views import (
    AdminLoginView,
    InstitutionApproveView,
    InstitutionRejectView
)

urlpatterns = [
    # Endpoint para que un administrador inicie sesión.
    path('login/', AdminLoginView.as_view(), name='admin-login'),
    
    # Endpoint para que un administrador apruebe una institución por su ID.
    path('<int:institution_id>/approve/', InstitutionApproveView.as_view(), name='institution-approve'),
    
    # Endpoint para que un administrador rechace una institución por su ID.
    path('<int:institution_id>/reject/', InstitutionRejectView.as_view(), name='institution-reject')
]