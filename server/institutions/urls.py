from django.urls import path
from .views import (
    InstitutionCreateView,
    InstitutionListView,
    InstitutionApproveView,
    InstitutionRejectView,
    InstitutionApproveUser,
    InstitutionRejectUser
)

urlpatterns = [
    path('register/', InstitutionCreateView.as_view(), name='institution-register'),
    path('list/', InstitutionListView.as_view(), name='institution-list'),
    path('<int:institution_id>/approve/', InstitutionApproveView.as_view(), name='institution-approve'),
    path('<int:institution_id>/reject/', InstitutionRejectView.as_view(), name='institution-reject'),
    path('approveUser/<int:institution_id>/<int:uid>/', InstitutionApproveUser.as_view(), name='institution-approve-user'),
    path('rejectUser/<int:institution_id>/<int:uid>/', InstitutionRejectUser.as_view(), name='institution-reject-user')
]
