from django.urls import path
from .views import (
    UsersCreateView,
    UsersLoginView,
    UsersDetailView,
    ApplyToBeDriverView,
)

urlpatterns = [
    path('register/', UsersCreateView.as_view(), name='users-register'),
    path('login/', UsersLoginView.as_view(), name='user-login'),
    path('apply-driver/<int:uid>/', ApplyToBeDriverView.as_view(), name='apply-driver')
]