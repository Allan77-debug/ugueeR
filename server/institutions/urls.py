from django.urls import path
from .views import InstitutionCreateView

urlpatterns = [
    path('register/', InstitutionCreateView.as_view(), name='institution-register'),
]
