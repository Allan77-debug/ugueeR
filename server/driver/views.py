# server/driver/views.py

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from travel.models import Travel
from driver.models import Driver
from users.permissions import IsAuthenticatedCustom
import logging
logger = logging.getLogger(__name__)
import requests

class RouteDirectionsView(APIView):
    """
    Vista que actúa como proxy para la API de Direcciones de Google Maps.
    Recibe coordenadas de inicio y fin, y devuelve la ruta calculada por Google.
    """
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request, *args, **kwargs):
        """Maneja las peticiones GET para obtener la ruta."""
        start_coords = request.query_params.get('start')
        end_coords = request.query_params.get('end')

        # Valida que los parámetros necesarios estén presentes.
        if not start_coords or not end_coords:
            return Response({"error": "Los parámetros 'start' y 'end' son requeridos."}, status=status.HTTP_400_BAD_REQUEST)

        # Obtiene la clave de API de forma segura desde la configuración.
        api_key = settings.API_KEY_GOOGLE_MAPS
        if not api_key:
             return Response({"error": "La clave de la API de Google Maps no está configurada en el servidor."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Prepara y realiza la petición a la API de Google.
        google_maps_url = 'https://maps.googleapis.com/maps/api/directions/json'
        params = {'origin': start_coords, 'destination': end_coords, 'key': api_key, 'language': 'es'}
        
        try:
            response = requests.get(google_maps_url, params=params)
            response.raise_for_status() # Lanza un error si la respuesta es 4xx o 5xx.
            data = response.json()
            
            # Valida el estado de la respuesta de Google antes de enviarla al cliente.
            if data.get('status') != 'OK':
                return Response({"error": f"Error de la API de Google: {data.get('status')}"}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response(data)
        except requests.exceptions.RequestException as e:
            return Response({"error": f"Error al contactar la API de Google Maps: {e}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
class ReverseGeocodeView(APIView):
    """
    Vista que actúa como proxy para la API de Geocoding de Google Maps.
    Convierte coordenadas (lat, lng) en una dirección legible.
    """
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request, *args, **kwargs):
        """Maneja las peticiones GET para obtener la dirección."""
        latlng = request.query_params.get('latlng')

        # Valida que el parámetro necesario esté presente.
        if not latlng:
            return Response({"error": "El parámetro 'latlng' es requerido."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Realiza la petición a Google de forma segura.
        api_key = settings.API_KEY_GOOGLE_MAPS
        # ... (lógica similar a la vista anterior) ...
        return Response(...)

class StartTravelView(APIView):
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request, travel_id, *args, **kwargs):
        user = request.user

        # --- LOGS DE DEPURACIÓN ---
        logger.info(f"--- INICIANDO DEPURACIÓN EN StartTravelView ---")
        logger.info(f"Usuario autenticado por el token: '{user.full_name}' con UID: {user.uid}")

        # Comprobemos si existe en la tabla Driver directamente.
        driver_exists = Driver.objects.filter(pk=user.uid).exists()
        logger.info(f"¿Existe un registro en la tabla 'driver' con pk={user.uid}? -> {driver_exists}")
        # --- FIN DE LOGS DE DEPURACIÓN ---

        try:
            # Esta es la línea que está fallando.
            driver = user.driver
            
            logger.info(f"¡ÉXITO! Se encontró el perfil de conductor para el UID {user.uid}. Estado: {driver.validate_state}")

            if driver.validate_state != 'approved':
                logger.warning(f"Validación fallida: El conductor {user.uid} no está aprobado. Estado actual: {driver.validate_state}")
                return Response({"error": "Solo los conductores aprobados pueden iniciar viajes."}, status=status.HTTP_403_FORBIDDEN)
        
        except Driver.DoesNotExist:
            logger.error(f"¡FALLO! Driver.DoesNotExist para el usuario con UID: {user.uid}. No se encontró un perfil de conductor asociado.")
            return Response({"error": "Acceso denicado. No tienes un perfil de conductor."}, status=status.HTTP_403_FORBIDDEN)

        # ... (el resto de la vista no cambia) ...
        try:
            travel = Travel.objects.get(id=travel_id)
        except Travel.DoesNotExist:
            return Response({"error": "No se encontró un viaje con el ID proporcionado."}, status=status.HTTP_404_NOT_FOUND)

        if travel.driver != driver:
            logger.warning(f"Validación fallida: El conductor del token (UID: {driver.pk}) no es el dueño del viaje (Dueño UID: {travel.driver.pk})")
            return Response({"error": "No tienes permiso para iniciar este viaje."}, status=status.HTTP_403_FORBIDDEN)

        if travel.travel_state != 'scheduled':
            return Response({"error": f"Este viaje no se puede iniciar. Estado actual: {travel.travel_state}."}, status=status.HTTP_400_BAD_REQUEST)
        
        travel.travel_state = 'in_progress'
        travel.save(update_fields=['travel_state'])

        return Response({"success": f"El viaje {travel.id} ha comenzado exitosamente."}, status=status.HTTP_200_OK)

class MarkTravelAsCompletedView(APIView):
    """
    Vista para que un conductor marque uno de sus viajes como 'completado'.
    """
    permission_classes = [IsAuthenticatedCustom]

    def patch(self, request, travel_id, *args, **kwargs):
        """Maneja la petición PATCH para cambiar el estado a 'completed'."""
        # La lógica de validación es muy similar a la de StartTravelView.
        # ...
        
        # Valida que el viaje no esté ya completado.
        if travel.travel_state == 'completed':
            return Response({"message": "Este viaje ya ha sido marcado como completado."}, status=status.HTTP_200_OK)
        
        # Actualiza y guarda el estado.
        travel.travel_state = 'completed'
        travel.save(update_fields=['travel_state'])

        return Response({"message": f"El viaje {travel.id} ha sido marcado como completado."}, status=status.HTTP_200_OK)