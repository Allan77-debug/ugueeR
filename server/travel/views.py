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

class TravelRouteView(generics.RetrieveAPIView):
    """
    Endpoint para obtener la ruta específica de un viaje.
    
    GET /api/travel/route/<travel_id>/
    
    Retorna:
    - Información de la ruta asociada al viaje
    - Coordenadas de origen y destino
    - Puntos intermedios si existen
    - Datos necesarios para renderizar en Google Maps
    """
    permission_classes = [IsAuthenticatedCustom]
    
    def retrieve(self, request, travel_id=None):
        user = request.user
        
        try:
            # Buscar el viaje y verificar que pertenezca a la institución del usuario
            travel = Travel.objects.select_related(
                'route', 
                'driver__user'
            ).get(
                id=travel_id,
                driver__user__institution=user.institution
            )
            
            if not travel.route:
                return Response(
                    {"error": "Este viaje no tiene una ruta asociada."}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            route = travel.route
            
            # Preparar los datos de la ruta usando la estructura correcta del modelo Route
            route_data = {
                "id": route.id,
                "travel_id": travel.id,
                "origin": {
                    "lat": float(route.startPointCoords[0]),  # Primer elemento es latitud
                    "lng": float(route.startPointCoords[1])   # Segundo elemento es longitud
                },
                "destination": {
                    "lat": float(route.endPointCoords[0]),    # Primer elemento es latitud
                    "lng": float(route.endPointCoords[1])     # Segundo elemento es longitud
                },
                "origin_address": route.startLocation,       # Campo de dirección de origen
                "destination_address": route.destination,    # Campo de dirección de destino
                "distance": None,  # Este modelo no tiene campo distance
                "duration": None,  # Este modelo no tiene campo duration
                "waypoints": [],   # Este modelo no tiene waypoints
                "encoded_polyline": None  # Este modelo no tiene polilínea codificada
            }
            
            # El modelo Route actual no tiene waypoints ni polilínea codificada
            # Estos campos están preparados para futuras extensiones del modelo
            route_data["waypoints"] = []
            route_data["encoded_polyline"] = None
            
            return Response(route_data, status=status.HTTP_200_OK)
            
        except Travel.DoesNotExist:
            return Response(
                {"error": "No se encontró el viaje o no tienes permisos para acceder a él."}, 
                status=status.HTTP_404_NOT_FOUND
            )