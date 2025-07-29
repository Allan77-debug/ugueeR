from django.urls import path
from .views import (
    UsersCreateView,
    UsersLoginView,
    UsersDetailView,
    UsersProfileView,
    ApplyToBeDriverView,
)

urlpatterns = [
    path('register/', UsersCreateView.as_view(), name='users-register'),
    path('login/', UsersLoginView.as_view(), name='user-login'),
    path('apply-to-driver/', ApplyToBeDriverView.as_view()),
    path('profile/<int:uid>/', UsersProfileView.as_view(), name='profile')
]    