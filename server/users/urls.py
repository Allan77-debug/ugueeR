# server/users/urls.py
from django.urls import path
from .views import (
    UsersCreateView,
    UsersLoginView,
    UsersProfileView,
    ApplyToBeDriverView,
)

# Define las rutas URL para la API de la aplicación 'users'.
urlpatterns = [
    # Endpoint para el registro de nuevos usuarios.
    path('register/', UsersCreateView.as_view(), name='registro-usuarios'),
    
    # Endpoint para el inicio de sesión de usuarios.
    path('login/', UsersLoginView.as_view(), name='login-usuario'),
    
    # Endpoint para que un usuario solicite ser conductor.
    path('apply-to-driver/', ApplyToBeDriverView.as_view(), name='aplicar-a-conductor'),
    
    # Endpoint para ver el perfil de un usuario específico por su UID.
    path('profile/<int:uid>/', UsersProfileView.as_view(), name='perfil-usuario'),
]