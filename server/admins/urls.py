from django.urls import path
from .views import (
    AdminLoginView,
    InstitutionApproveView,
    InstitutionRejectView
)

urlpatterns = [
    path('login/', AdminLoginView.as_view(), name='admin-login'),
    path('<int:institution_id>/approve/', InstitutionApproveView.as_view(), name='institution-approve'),
    path('<int:institution_id>/reject/', InstitutionRejectView.as_view(), name='institution-reject')
]
