

from django.urls import path
from .views import (
    AssessmentCreateView,
    AssessmentDetailView,
    AssessmentListView,
    DriverAssessmentsListView,
)

urlpatterns = [
    path('assessment/create/', AssessmentCreateView.as_view(), name='assessment-create'),
    
    path('assessment/<int:pk>/', AssessmentDetailView.as_view(), name='assessment-detail'),
    
    path('assessments/', AssessmentListView.as_view(), name='assessment-list-all'),

    path('assessments/driver/<int:driver_id>/', DriverAssessmentsListView.as_view(), name='assessment-list-by-driver'),
]