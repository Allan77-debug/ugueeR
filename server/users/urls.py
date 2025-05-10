from django.urls import path
from .views import (
    UsersCreateView,
    UsersLoginView
)

urlpatterns = [
    path('register/', UsersCreateView.as_view(), name='users-register'),
    path('login/', UsersLoginView.as_view(), name='user-login'),
]
