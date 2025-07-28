from django.shortcuts import render

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Driver, Travel
from .serializers import TravelSerializer,TravelInfoSerializer, TravelDetailSerializer
from users.permissions import IsAuthenticatedCustom



class TravelCreateView(generics.CreateAPIView):
    """
    Endpoint para registrar un nuevo viaje.

    POST /api/travel/create/

    Requiere:
    - driver (ID)
    - vehicle (ID)
    - route (ID)
    - time (datetime en formato ISO)
    - price (entero)
    - travel_state ("scheduled, in_progress, cancelled")

    Retorna:
    - 201 Created con los datos del viaje creado
    """
    permission_classes = [IsAuthenticatedCustom]
    serializer_class = TravelSerializer
    queryset = Travel.objects.all()


class DriverTravelListView(generics.ListAPIView):
    """
    Endpoint para listar todos los viajes de un conductor.

    GET /api/travel/driver/<driver_id>/

    Parámetros:
    - driver_id (int): ID del conductor

    Retorna:
    - Lista de viajes asociados al conductor
    """
    permission_classes = [IsAuthenticatedCustom]
    serializer_class = TravelInfoSerializer

    def get_queryset(self):
        driver_id = self.kwargs.get('driver_id')
        return Travel.objects.filter(driver_id=driver_id)


class TravelDeleteView(generics.DestroyAPIView):
    """
    Endpoint para eliminar un viaje por ID.

    DELETE /api/travel/delete/<id>/

    Parámetros:
    - id (int): ID del viaje a eliminar

    Retorna:
    - 204 No Content si fue exitoso
    - 404 Not Found si el viaje no existe
    """
    permission_classes = [IsAuthenticatedCustom]
    queryset = Travel.objects.all()
    lookup_field = 'id'
class InstitutionTravelListView(generics.ListAPIView):
    """
    Endpoint para listar todos los viajes de la institución del usuario autenticado,
    con información detallada de conductor, vehículo, RUTA y campos calculados.
    
    GET /api/travel/institution/
    """
    permission_classes = [IsAuthenticatedCustom]
    serializer_class = TravelDetailSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.institution:
            return Travel.objects.none()
    
        queryset = Travel.objects.filter(
            driver__user__institution=user.institution
        ).select_related(
            'driver__user',
            'vehicle',
            'route'  
        ).prefetch_related(
            'realize__user', # Añadimos prefetch para las reservaciones y sus usuarios
            'driver__assessments'
        ).order_by('-time')

        return queryset