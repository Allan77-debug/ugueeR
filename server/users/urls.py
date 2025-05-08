from django.urls import path
from .views import (
    UsersCreateView,
)

urlpatterns = [
    path('register/', UsersCreateView.as_view(), name='users-register'),
]
