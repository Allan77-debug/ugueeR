from django.shortcuts import render

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Driver, Travel
from .serializers import TravelSerializer,TravelInfoSerializer
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
    Endpoint para listar todos los viajes de la institución del usuario autenticado.

    Filtra los viajes para mostrar solo aquellos cuyo conductor pertenece a la
    misma institución que el usuario que realiza la petición.
    
    GET /api/travel/institution/
    """
    permission_classes = [IsAuthenticatedCustom]
    serializer_class = TravelInfoSerializer

    def get_queryset(self):
        # 1. Obtenemos el usuario autenticado. Gracias a `IsAuthenticatedCustom`,
        #    esto ya es una instancia completa de nuestro modelo `Users`.
        user = self.request.user

        # 2. Verificamos que el usuario tenga una institución asignada.
        #    Si no la tiene, no puede ver viajes de "su" institución.
        if not user.institution:
            # Retornamos un queryset vacío. Es la forma correcta de no devolver nada.
            return Travel.objects.none()

        # 3. ¡LA MAGIA DEL ORM! Filtramos los viajes.
        #    La sintaxis de doble guion bajo '__' nos permite "saltar"
        #    a través de las relaciones entre modelos:
        #    Travel -> driver (ForeignKey a Driver)
        #    driver -> user (OneToOneField a Users)
        #    user -> institution (ForeignKey a Institution)
        queryset = Travel.objects.filter(
            driver__user__institution=user.institution
        ).select_related(
            'driver__user'  # Optimización para evitar N+1 queries en el serializador
        ).order_by('-time') # Opcional: ordenar por los más recientes primero

        return queryset