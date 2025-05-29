from django.urls import path
from .views import (
    InstitutionCreateView,
    InstitutionListView,
    InstitutionApproveUser,
    InstitutionRejectUser,
    InstitutionUsersView,
    InstitutionLoginView,
    DriverApplicationsListView,
    ApproveDriverView,  
    RejectDriverView,  
)

urlpatterns = [
    path('register/', InstitutionCreateView.as_view(), name='institution-register'),
    path('list/', InstitutionListView.as_view(), name='institution-list'),
    path('approveUser/<int:institution_id>/<str:uid>/', InstitutionApproveUser.as_view(), name='institution-approve-user'),
    path('rejectUser/<int:institution_id>/<str:uid>/', InstitutionRejectUser.as_view(), name='institution-reject-user'),
    path('listUser/<int:institution_id>/users/', InstitutionUsersView.as_view(), name='institution-users'),
    path('login/', InstitutionLoginView.as_view(), name ='institution-login'),
    path('<int:institution_id>/driver-applications/', DriverApplicationsListView.as_view(), name='driver-applications-list'),
    path('<int:institution_id>/approve-driver/<str:uid>/', ApproveDriverView.as_view(), name='approve-driver'),  # URL for approving driver
    path('<int:institution_id>/reject-driver/<str:uid>/', RejectDriverView.as_view(), name='reject-driver'),  # URL for rejecting driver
]