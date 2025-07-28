# server/route/views.py

from rest_framework import generics
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from drf_yasg.utils import swagger_auto_schema # <-- Importación añadida
from .models import Route
from .serializers import RouteSerializer
from driver.models import Driver
from users.models import Users
from users.permissions import IsAuthenticatedCustom
import logging

logger = logging.getLogger(__name__)

class RouteCreateView(generics.CreateAPIView):
    """Vista para que un conductor cree una nueva ruta."""
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [IsAuthenticatedCustom]

    @swagger_auto_schema(operation_summary="Endpoint para crear una nueva ruta")
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class RouteListView(generics.ListAPIView):
    """
    Vista para listar todas las rutas disponibles para los conductores
    aprobados de la misma institución que el usuario autenticado.
    """
    serializer_class = RouteSerializer
    permission_classes = [IsAuthenticatedCustom]

    @swagger_auto_schema(operation_summary="Endpoint para listar rutas de la institución")
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        """
        Filtra las rutas para mostrar solo las que pertenecen a conductores
        aprobados de la institución del usuario que hace la petición.
        """
        user = self.request.user
        if not user.institution:
            return Route.objects.none()
        drivers_aprobados = Driver.objects.filter(
            user__institution=user.institution,
            user__driver_state=Users.DRIVER_STATE_APPROVED
        )
        return Route.objects.filter(driver__in=drivers_aprobados)

class RouteDetailView(generics.ListAPIView): 
    """
    Vista para que un conductor autenticado y aprobado liste
    únicamente sus propias rutas.
    """
    serializer_class = RouteSerializer
    permission_classes = [IsAuthenticatedCustom]

    @swagger_auto_schema(operation_summary="Endpoint para listar mis rutas (conductor)")
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        """
        Filtra las rutas para devolver solo las que pertenecen al conductor
        que realiza la petición.
        """
        user = self.request.user
        if not hasattr(user, 'driver'):
            logger.warning(f"Usuario {user.uid} intentó acceder a rutas de conductor pero no tiene un perfil de Driver asociado.")
            raise PermissionDenied("Acceso denegado: Este usuario no está asociado a un perfil de conductor.")
        if user.driver.validate_state != 'approved':
             logger.info(f"Conductor {user.uid} no está aprobado. Estado de validación: {user.driver.validate_state}")
             raise PermissionDenied(f"Acceso denegado: Su perfil de conductor no está aprobado (estado: {user.driver.validate_state}).")
        return Route.objects.filter(driver=user.driver)

class RouteDeleteView(generics.DestroyAPIView):
    """Vista para que un conductor elimine una de sus rutas."""
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [IsAuthenticatedCustom]
    lookup_field = 'id'

    @swagger_auto_schema(operation_summary="Endpoint para eliminar una de mis rutas")
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)