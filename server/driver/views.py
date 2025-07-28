# server/driver/views.py

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema # <-- Importar
from travel.models import Travel
from driver.models import Driver
from users.permissions import IsAuthenticatedCustom
import logging
logger = logging.getLogger(__name__)
import requests

class RouteDirectionsView(APIView):

    permission_classes = [IsAuthenticatedCustom]

    @swagger_auto_schema(operation_summary="Endpoint para obtener direcciones entre dos puntos usando la API de Google Maps.")
    def get(self, request, *args, **kwargs):
        """Maneja las peticiones GET para obtener la ruta."""
        start_coords = request.query_params.get('start')
        end_coords = request.query_params.get('end')
        if not start_coords or not end_coords:
            return Response({"error": "Los parámetros 'start' y 'end' son requeridos."}, status=status.HTTP_400_BAD_REQUEST)
        api_key = settings.API_KEY_GOOGLE_MAPS
        if not api_key:
             return Response({"error": "La clave de la API de Google Maps no está configurada en el servidor."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        google_maps_url = 'https://maps.googleapis.com/maps/api/directions/json'
        params = {'origin': start_coords, 'destination': end_coords, 'key': api_key, 'language': 'es'}
        try:
            response = requests.get(google_maps_url, params=params)
            response.raise_for_status()
            data = response.json()
            if data.get('status') != 'OK':
                return Response({"error": f"Error de la API de Google: {data.get('status')}"}, status=status.HTTP_400_BAD_REQUEST)
            return Response(data)
        except requests.exceptions.RequestException as e:
            return Response({"error": f"Error al contactar la API de Google Maps: {e}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
class ReverseGeocodeView(APIView):
    permission_classes = [IsAuthenticatedCustom]

    @swagger_auto_schema(operation_summary="Endpoint para convertir coordenadas (lat, lng) en una dirección postal legible.")
    def get(self, request, *args, **kwargs):
        """Maneja las peticiones GET para obtener la dirección."""
        latlng = request.query_params.get('latlng')
        if not latlng:
            return Response({"error": "El parámetro 'latlng' es requerido."}, status=status.HTTP_400_BAD_REQUEST)
        api_key = settings.API_KEY_GOOGLE_MAPS
        if not api_key:
             return Response({"error": "La clave de la API de Google Maps no está configurada en el servidor."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        google_geocode_url = 'https://maps.googleapis.com/maps/api/geocode/json'
        params = {'latlng': latlng, 'key': api_key, 'language': 'es'}
        try:
            response = requests.get(google_geocode_url, params=params)
            response.raise_for_status()
            data = response.json()
            if data.get('status') != 'OK':
                return Response({"error": f"Error de la API de Google: {data.get('status')}"}, status=status.HTTP_400_BAD_REQUEST)
            return Response(data)
        except requests.exceptions.RequestException as e:
            return Response({"error": f"Error al contactar la API de Geocoding de Google: {e}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

class StartTravelView(APIView):
    
    permission_classes = [IsAuthenticatedCustom]

    @swagger_auto_schema(operation_summary="Endpoint para que un conductor inicie un viaje que estaba previamente programado.")
    def post(self, request, travel_id, *args, **kwargs):
        """Maneja la petición POST para cambiar el estado del viaje a 'in_progress'."""
        user = request.user
        logger.info(f"--- INICIANDO DEPURACIÓN EN StartTravelView ---")
        logger.info(f"Usuario autenticado por el token: '{user.full_name}' con UID: {user.uid}")
        driver_exists = Driver.objects.filter(pk=user.uid).exists()
        logger.info(f"¿Existe un registro en la tabla 'driver' con pk={user.uid}? -> {driver_exists}")
        try:
            driver = user.driver
            logger.info(f"¡ÉXITO! Se encontró el perfil de conductor para el UID {user.uid}. Estado: {driver.validate_state}")
            if driver.validate_state != 'approved':
                logger.warning(f"Validación fallida: El conductor {user.uid} no está aprobado. Estado actual: {driver.validate_state}")
                return Response({"error": "Solo los conductores aprobados pueden iniciar viajes."}, status=status.HTTP_403_FORBIDDEN)
        except Driver.DoesNotExist:
            logger.error(f"¡FALLO! Driver.DoesNotExist para el usuario con UID: {user.uid}. No se encontró un perfil de conductor asociado.")
            return Response({"error": "Acceso denegado. No tienes un perfil de conductor."}, status=status.HTTP_403_FORBIDDEN)
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
   
    permission_classes = [IsAuthenticatedCustom]

    @swagger_auto_schema(operation_summary="Endpoint para que un conductor marque uno de sus viajes como 'completado'.")
    def patch(self, request, travel_id, *args, **kwargs):
        """Maneja la petición PATCH para cambiar el estado a 'completed'."""
        user = request.user
        try:
            driver = user.driver
            if driver.validate_state != 'approved':
                return Response({"error": "Solo los conductores aprobados pueden marcar viajes como completados."}, status=status.HTTP_403_FORBIDDEN)
        except Driver.DoesNotExist:
            return Response({"error": "Acceso denegado. No tienes un perfil de conductor."}, status=status.HTTP_403_FORBIDDEN)
        try:
            travel = Travel.objects.get(id=travel_id)
        except Travel.DoesNotExist:
            return Response({"error": "No se encontró un viaje con el ID proporcionado."}, status=status.HTTP_404_NOT_FOUND)
        if travel.driver != driver:
            return Response({"error": "No tienes permiso para modificar este viaje."}, status=status.HTTP_403_FORBIDDEN)
        if travel.travel_state == 'completed':
            return Response({"message": "Este viaje ya ha sido marcado como completado."}, status=status.HTTP_200_OK)
        travel.travel_state = 'completed'
        travel.save(update_fields=['travel_state'])
        return Response({"message": f"El viaje {travel.id} ha sido marcado como completado."}, status=status.HTTP_200_OK)