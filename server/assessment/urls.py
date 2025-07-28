"""
Define las rutas de la API para la aplicación 'assessment'.

Este archivo mapea las URLs a las vistas correspondientes, creando los endpoints
que el frontend consumirá para las operaciones relacionadas con las calificaciones.
"""
from django.urls import path
from .views import (
    AssessmentCreateView,
    AssessmentDetailView,
    AssessmentListView,
    DriverAssessmentsListView,
)

urlpatterns = [
    # Endpoint para que un usuario cree una nueva calificación.
    path('assessment/create/', AssessmentCreateView.as_view(), name='assessment-create'),
    
    # Endpoint para ver, actualizar o eliminar una calificación específica por su ID.
    path('assessment/<int:pk>/', AssessmentDetailView.as_view(), name='assessment-detail'),
    
    # Endpoint para listar todas las calificaciones (generalmente para administradores).
    path('assessments/', AssessmentListView.as_view(), name='assessment-list-all'),

    # Endpoint para listar todas las calificaciones de un conductor específico por su ID.
    path('assessments/driver/<int:driver_id>/', DriverAssessmentsListView.as_view(), name='assessment-list-by-driver'),
]