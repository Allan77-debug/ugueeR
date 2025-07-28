# server/travel/views.py
from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from .models import Travel
from .serializers import TravelSerializer, TravelDetailSerializer, DriverTravelWithReservationsSerializer
from users.permissions import IsAuthenticatedCustom
from route.serializers import RouteSerializer as RouteModelSerializer # Alias para evitar confusion

class TravelCreateView(generics.CreateAPIView):
    """
    Vista para que un conductor cree un nuevo viaje.
    Requiere que el usuario esté autenticado.
    """
    permission_classes = [IsAuthenticatedCustom]
    serializer_class = TravelSerializer
    queryset = Travel.objects.all()

    @swagger_auto_schema(
        operation_summary="Endpoint para crear un nuevo viaje",
        operation_description="""
        Permite a un conductor autenticado registrar un nuevo viaje.
        **Requiere:**
        - `driver` (ID del perfil de conductor)
        - `vehicle` (ID del vehículo)
        - `route` (ID de la ruta)
        - `time` (Fecha y hora en formato ISO 8601, ej: "2025-12-31T18:00:00Z")
        - `price` (Entero)
        - `travel_state` (Por lo general, se crea como "scheduled")
        **Retorna:** 201 Created con los datos del viaje creado.
        """
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class DriverTravelListView(generics.ListAPIView):
    """
    Vista para que un conductor liste únicamente sus propios viajes,
    incluyendo para cada uno la lista completa de sus reservaciones.
    """
    permission_classes = [IsAuthenticatedCustom]
    serializer_class = DriverTravelWithReservationsSerializer

    @swagger_auto_schema(
        operation_summary="Endpoint para listar mis viajes (conductor) con reservaciones",
        operation_description="Obtiene todos los viajes del conductor especificado en la URL, incluyendo detalles anidados de las reservaciones, vehículo y ruta para cada viaje."
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    def get_queryset(self):
        """
        Filtra los viajes para devolver solo los del conductor especificado en la URL.
        
        Además, optimiza la consulta para traer los datos relacionados de
        reservaciones, usuarios, vehículos y rutas, evitando múltiples llamadas a la BD
        (problema N+1) usando `select_related` para relaciones uno a uno y
        `prefetch_related` para relaciones muchos a uno/muchos a muchos.
        """
        driver_id = self.kwargs.get('driver_id')
        # Valida que el usuario que hace la petición es el conductor solicitado o un admin
        if not (self.request.user.driver.user_id == driver_id or self.request.user.is_staff):
             raise PermissionDenied("No tienes permiso para ver los viajes de otro conductor.")

        return Travel.objects.filter(
            driver_id=driver_id
        ).select_related(
            'vehicle', 'route'  # Optimiza para relaciones ForeignKey
        ).prefetch_related(
            'realize__user'  # Optimiza para relaciones inversas (ForeignKey desde Realize)
        ).order_by('-time')

class TravelDeleteView(generics.DestroyAPIView):
    """
    Vista para que un conductor elimine uno de sus viajes.
    """
    permission_classes = [IsAuthenticatedCustom]
    queryset = Travel.objects.all()
    lookup_field = 'id'

    @swagger_auto_schema(
        operation_summary="Endpoint para eliminar uno de mis viajes",
        operation_description="""
        Elimina un viaje específico por su ID.
        **Parámetros en URL:**
        - `id` (int): ID del viaje a eliminar.
        **Retorna:**
        - 204 No Content si fue exitoso.
        - 404 Not Found si el viaje no existe.
        - 403 Forbidden si el usuario no es el dueño del viaje.
        """
    )
    def delete(self, request, *args, **kwargs):
        # Opcional: añadir una capa extra de seguridad para asegurar que solo el dueño puede borrar
        travel = self.get_object()
        if travel.driver.user != request.user:
            return Response({"error": "No tienes permiso para eliminar este viaje."}, status=status.HTTP_403_FORBIDDEN)
        return super().delete(request, *args, **kwargs)

class InstitutionTravelListView(generics.ListAPIView):
    """
    Vista para listar todos los viajes disponibles en la institución del
    usuario autenticado, con información detallada y enriquecida.
    """
    permission_classes = [IsAuthenticatedCustom]
    serializer_class = TravelDetailSerializer

    @swagger_auto_schema(
        operation_summary="Endpoint para listar viajes de la institución",
        operation_description="""
        Obtiene una lista de todos los viajes asociados a la institución del usuario que realiza la petición.
        La información de cada viaje incluye datos del conductor, vehículo, ruta y campos calculados
        como el puntaje del conductor y los asientos disponibles.
        Si el usuario que consulta es el conductor de un viaje en la lista, verá también
        los detalles de las reservaciones para ESE viaje.
        """
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        """
        Filtra los viajes para mostrar solo los de la institución del usuario.
        Optimiza la consulta para incluir eficientemente todos los datos relacionados.
        """
        user = self.request.user
        if not user.institution:
            return Travel.objects.none() # Devuelve un queryset vacío si el usuario no tiene institución

        queryset = Travel.objects.filter(
            driver__user__institution=user.institution
        ).select_related(
            'driver__user', # Carga el perfil de usuario del conductor
            'vehicle',      # Carga el vehículo del viaje
            'route'         # Carga la ruta del viaje
        ).prefetch_related(
            'realize__user',     # Precarga las reservaciones y el usuario de cada reserva
            'driver__assessments'# Precarga las evaluaciones para calcular el score
        ).order_by('-time')

        return queryset

class TravelRouteView(generics.RetrieveAPIView):
    """
    Vista para obtener la información geoespacial detallada de la ruta
    asociada a un viaje específico, formateada para ser usada en un mapa.
    """
    permission_classes = [IsAuthenticatedCustom]
    # No se usa serializer_class porque la respuesta se construye manualmente.
    
    @swagger_auto_schema(
        operation_summary="Endpoint para obtener los detalles de la ruta de un viaje",
        operation_description="""
        Obtiene la información de la ruta asociada a un viaje específico por su ID.
        **Requiere:** Autenticación y que el viaje pertenezca a la misma institución que el usuario.
        **Retorna:** Un objeto JSON con las coordenadas de origen y destino, direcciones
        y otros datos necesarios para renderizar la ruta en un mapa (ej. Google Maps).
        """
    )
    def retrieve(self, request, travel_id=None):
        """
        Lógica para recuperar y formatear los datos de la ruta de un viaje.
        """
        user = request.user
        
        try:
            # Buscar el viaje y verificar que pertenezca a la institución del usuario.
            # Se usa select_related para obtener la ruta y el usuario del conductor en una sola query.
            travel = Travel.objects.select_related(
                'route', 
                'driver__user__institution'
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
            
            # Prepara los datos de la ruta usando la estructura esperada por el frontend.
            # Asume que startPointCoords y endPointCoords son arrays/listas [lat, lng].
            route_data = {
                "id": route.id,
                "travel_id": travel.id,
                "origin": {
                    "lat": float(route.startPointCoords[0]),
                    "lng": float(route.startPointCoords[1])
                },
                "destination": {
                    "lat": float(route.endPointCoords[0]),
                    "lng": float(route.endPointCoords[1])
                },
                "origin_address": route.startLocation,
                "destination_address": route.destination,
                # Estos campos se incluyen para mantener una API consistente,
                # aunque el modelo Route actual no los contenga.
                "waypoints": route.via_points if hasattr(route, 'via_points') else [],
                "encoded_polyline": route.polyline if hasattr(route, 'polyline') else None
            }
            
            return Response(route_data, status=status.HTTP_200_OK)
            
        except Travel.DoesNotExist:
            return Response(
                {"error": "No se encontró el viaje o no tienes permisos para acceder a él."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except (TypeError, IndexError):
             return Response(
                {"error": "Los datos de coordenadas de la ruta están malformados."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )