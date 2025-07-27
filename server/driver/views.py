# server/driver/views.py (archivo modificado)

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from travel.models import Travel # Necesitamos el modelo Travel
from driver.models import Driver
from users.permissions import IsAuthenticatedCustom
import requests

class RouteDirectionsView(APIView):
    """
    Una vista proxy para obtener direcciones de la API de Google Maps.
    Recibe coordenadas de 'start' y 'end' como query params.
    Ejemplo: /api/driver/route-directions/?start=3.123,-76.123&end=3.456,-76.456
    """
    def get(self, request, *args, **kwargs):
        # Obtener coordenadas de los query parameters
        start_coords = request.query_params.get('start')
        end_coords = request.query_params.get('end')

        if not start_coords or not end_coords:
            return Response(
                {"error": "Los parámetros 'start' y 'end' son requeridos."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Obtener la clave de la API 
        api_key = settings.API_KEY_GOOGLE_MAPS
        if not api_key:
             return Response(
                {"error": "La clave de la API de Google Maps no está configurada en el servidor."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Construir la URL de la API de Google Maps Directions
        google_maps_url = 'https://maps.googleapis.com/maps/api/directions/json'
        
        params = {
            'origin': start_coords,
            'destination': end_coords,
            'key': api_key,
            'language': 'es', # Opcional: para obtener instrucciones en español
        }
        
        try:
            # Realizar la petición a Google
            response = requests.get(google_maps_url, params=params)
            response.raise_for_status() # Lanza un error para códigos 4xx/5xx

            data = response.json() # Convertimos la respuesta a JSON aquí

            # --- AÑADIR ESTA VALIDACIÓN ---
            # Google API devuelve un 'status' en su respuesta. 
            # Si no es 'OK', hay un problema.
            if data.get('status') != 'OK':
                # Devolvemos el error de Google al frontend para que sepamos qué pasa
                return Response({
                    "error": f"Error de la API de Google: {data.get('status')}",
                    "google_response": data # Opcional: para más detalles
                }, status=status.HTTP_400_BAD_REQUEST)
            # --- FIN DE LA VALIDACIÓN ---

            return Response(data) # Enviamos la data ya parseada

        except requests.exceptions.RequestException as e:
            # Manejar errores de conexión o de la API de Google
            return Response(
                {"error": f"Error al contactar la API de Google Maps: {e}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
# server/driver/views.py 

class ReverseGeocodeView(APIView):
    """
    Una vista proxy para obtener una dirección a partir de coordenadas
    usando la API de Geocoding de Google Maps.
    Recibe 'latlng' como query param.
    Ejemplo: /api/driver/reverse-geocode/?latlng=3.123,-76.123
    """
    def get(self, request, *args, **kwargs):
        latlng = request.query_params.get('latlng')

        if not latlng:
            return Response(
                {"error": "El parámetro 'latlng' es requerido."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        api_key = settings.API_KEY_GOOGLE_MAPS
        if not api_key:
             return Response(
                {"error": "La clave de la API de Google Maps no está configurada en el servidor."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        google_geocode_url = 'https://maps.googleapis.com/maps/api/geocode/json'
        
        params = {
            'latlng': latlng,
            'key': api_key,
            'language': 'es',
        }
        
        try:
            response = requests.get(google_geocode_url, params=params)
            response.raise_for_status()
            
            data = response.json() # Convertimos la respuesta a JSON aquí

            # --- AÑADIR ESTA VALIDACIÓN ---
            # Google API devuelve un 'status' en su respuesta. 
            # Si no es 'OK', hay un problema.
            if data.get('status') != 'OK':
                # Devolvemos el error de Google al frontend para que sepamos qué pasa
                return Response({
                    "error": f"Error de la API de Google: {data.get('status')}",
                    "google_response": data # Opcional: para más detalles
                }, status=status.HTTP_400_BAD_REQUEST)
            # --- FIN DE LA VALIDACIÓN ---

            return Response(data) # Enviamos la data ya parseada

        except requests.exceptions.RequestException as e:
            return Response(
                {"error": f"Error al contactar la API de Geocoding de Google: {e}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
# server/driver/views.py (archivo modificado)

class MarkTravelAsCompletedView(APIView):
    """
    Endpoint para que un conductor autenticado y aprobado marque
    uno de sus propios viajes como 'completado'.
    
    PATCH: /api/driver/travel/<int:travel_id>/complete/
    """
    permission_classes = [IsAuthenticatedCustom]

    def patch(self, request, travel_id, *args, **kwargs):
        user = request.user

        # 1. Verificar si el usuario es un conductor aprobado
        try:
            # Django nos permite acceder al perfil de conductor directamente desde el usuario
            # gracias al OneToOneField con related_name='driver'
            driver = user.driver 
            if driver.validate_state != 'approved':
                return Response(
                    {"error": "Solo los conductores aprobados pueden modificar viajes."},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Driver.DoesNotExist:
            return Response(
                {"error": "Acceso denegado. No tienes un perfil de conductor."},
                status=status.HTTP_403_FORBIDDEN
            )

        # 2. Obtener la instancia del viaje
        try:
            travel = Travel.objects.get(id=travel_id)
        except Travel.DoesNotExist:
            return Response(
                {"error": "No se encontró un viaje con el ID proporcionado."},
                status=status.HTTP_404_NOT_FOUND
            )

        # 3. Verificar que el viaje le pertenece al conductor autenticado
        if travel.driver != driver:
            return Response(
                {"error": "No tienes permiso para modificar este viaje, no te pertenece."},
                status=status.HTTP_403_FORBIDDEN
            )

        # 4. Verificar si el viaje ya está completado
        if travel.travel_state == 'completed':
            return Response(
                {"message": "Este viaje ya ha sido marcado como completado anteriormente."},
                status=status.HTTP_200_OK
            )
        
        # 5. Actualizar el estado y guardar
        travel.travel_state = 'completed'
        travel.save(update_fields=['travel_state']) # Optimización: solo actualiza este campo

        # Opcional: Serializar y devolver el viaje actualizado
        # from travel.serializers import TravelSerializer
        # serializer = TravelSerializer(travel)
        # return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(
            {"message": f"El viaje {travel.id} ha sido marcado como completado exitosamente."},
            status=status.HTTP_200_OK
        )