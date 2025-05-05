from django.urls import path
from .views import (
    InstitutionCreateView,
    InstitutionListView,
    InstitutionApproveView,
    InstitutionRejectView
)

urlpatterns = [
    path('register/', InstitutionCreateView.as_view(), name='institution-register'),
    path('list/', InstitutionListView.as_view(), name='institution-list'),
    path('<int:institution_id>/approve/', InstitutionApproveView.as_view(), name='institution-approve'),
    path('<int:institution_id>/reject/', InstitutionRejectView.as_view(), name='institution-reject'),
]
