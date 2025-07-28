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
            
            # Preparar los datos de la ruta
            route_data = {
                "id": route.id,
                "travel_id": travel.id,
                "origin": {
                    "lat": float(route.origin_lat),
                    "lng": float(route.origin_lng)
                },
                "destination": {
                    "lat": float(route.destination_lat),
                    "lng": float(route.destination_lng)
                },
                "origin_address": route.origin_address,
                "destination_address": route.destination_address,
                "distance": route.distance,
                "duration": route.duration,
                "waypoints": [],
                "encoded_polyline": None  # Para la polilínea de Google Maps
            }
            
            # Si hay waypoints guardados (puntos intermedios)
            if hasattr(route, 'waypoints') and route.waypoints:
                try:
                    import json
                    waypoints = json.loads(route.waypoints) if isinstance(route.waypoints, str) else route.waypoints
                    route_data["waypoints"] = waypoints
                except (json.JSONDecodeError, AttributeError):
                    route_data["waypoints"] = []
            
            # Si hay polilínea codificada guardada
            if hasattr(route, 'encoded_polyline') and route.encoded_polyline:
                route_data["encoded_polyline"] = route.encoded_polyline
            
            return Response(route_data, status=status.HTTP_200_OK)
            
        except Travel.DoesNotExist:
            return Response(
                {"error": "No se encontró el viaje o no tienes permisos para acceder a él."}, 
                status=status.HTTP_404_NOT_FOUND
            )