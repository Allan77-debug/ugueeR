from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Route
from .serializers import RouteSerializer
from driver.models import Driver
from users.models import Users
from institutions.models import Institution
from users.permissions import IsAuthenticatedCustom

import logging
logger = logging.getLogger(__name__)
class RouteCreateView(generics.CreateAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer

class RouteListView(generics.ListAPIView):
    serializer_class = RouteSerializer
    permission_classes = [IsAuthenticatedCustom]

    def get_queryset(self):
        user = self.request.user  # Este lo setea tu IsAuthenticatedCustom

        if not user.institution:
            return Route.objects.none()

        drivers_aprobados = Driver.objects.filter(
            user__institution=user.institution,
            user__driver_state=Users.DRIVER_STATE_APPROVED
        )

        return Route.objects.filter(driver__in=drivers_aprobados)


class RouteDetailView(generics.RetrieveAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    lookup_field = 'driver_id'

class RouteDeleteView(generics.DestroyAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    lookup_field = 'id'