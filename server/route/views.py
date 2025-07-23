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


class RouteDetailView(generics.ListAPIView): 
    serializer_class = RouteSerializer
    permission_classes = [IsAuthenticatedCustom] 

    def get_queryset(self):
        user = self.request.user

        if not hasattr(user, 'driver'):
            logger.warning(f"Usuario {user.uid} ({user.user_type}) intentó acceder a rutas de conductor pero no tiene un perfil de Driver asociado.")
            raise PermissionDenied("Acceso denegado: Este usuario no está asociado a un perfil de conductor.")


       
        if user.driver.validate_state != 'approved':
             logger.info(f"Conductor {user.uid} no está aprobado. Estado de validación: {user.driver.validate_state}")
             raise PermissionDenied(f"Acceso denegado: Su perfil de conductor no está aprobado (estado: {user.driver.validate_state}).")

    
        return Route.objects.filter(driver=user.driver)

class RouteDeleteView(generics.DestroyAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    lookup_field = 'id'