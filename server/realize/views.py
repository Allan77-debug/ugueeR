# server/realize/views.py

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound, ValidationError
from drf_yasg.utils import swagger_auto_schema
from .models import Realize
from .serializers import RealizeSerializer, RealizeCreateSerializer
from users.permissions import IsAuthenticatedCustom
from users.models import Users

class UserRealizeListView(generics.ListAPIView):
    """
    Vista para listar TODAS y ÚNICAMENTE las reservas del usuario autenticado.
    """
    serializer_class = RealizeSerializer
    permission_classes = [IsAuthenticatedCustom]

    @swagger_auto_schema(operation_summary="Endpoint para listar mis reservas")
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        """
        Sobrescribe el método para devolver únicamente las reservas
        asociadas al usuario que realiza la petición (request.user).
        """
        # Se obtiene el usuario autenticado directamente del objeto request.
        user = self.request.user
        
        # Se filtra el queryset de Realize para que solo incluya las reservas
        # donde el campo 'user' sea igual al usuario autenticado.
        # select_related optimiza la consulta para traer los datos del viaje relacionado.
        return Realize.objects.filter(user=user).select_related('user', 'travel')


class RealizeCreateView(generics.CreateAPIView):
    """Vista para crear una nueva reserva."""
    serializer_class = RealizeCreateSerializer
    permission_classes = [IsAuthenticatedCustom]

    @swagger_auto_schema(operation_summary="Endpoint para crear una nueva reserva")
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Asigna el usuario autenticado y valida la disponibilidad de asientos."""
        travel_instance = serializer.validated_data.get('travel')
        if travel_instance:
            capacity = travel_instance.vehicle.capacity
            confirmed_reservations = Realize.objects.filter(travel=travel_instance, status=Realize.STATUS_CONFIRMED).count()
            if (capacity - confirmed_reservations) <= 0:
                raise ValidationError("No hay asientos disponibles para este viaje.")
        serializer.save(user=self.request.user)

class RealizeCancelView(generics.UpdateAPIView):
    """Vista para cancelar una reserva."""
    queryset = Realize.objects.all()
    serializer_class = RealizeSerializer
    permission_classes = [IsAuthenticatedCustom]
    http_method_names = ['patch']

    @swagger_auto_schema(operation_summary="Endpoint para cancelar una reserva")
    def patch(self, request, *args, **kwargs):
        """Maneja la solicitud PATCH para la cancelación."""
        instance = self.get_object()
        if 'status' not in request.data or request.data['status'] != Realize.STATUS_CANCELLED:
            return Response({"detail": "Solo se permite cambiar el estado a 'cancelled'."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class RealizeConfirmView(APIView):
    """
    Vista para que un USUARIO confirme su propia reserva pendiente.
    Esta acción sería activada, por ejemplo, al escanear un código QR del conductor.
    """
    permission_classes = [IsAuthenticatedCustom] # Requiere autenticación del usuario.

    @swagger_auto_schema(operation_summary="Endpoint para confirmar una reserva")
    def post(self, request, realize_id, *args, **kwargs):
        """
        Maneja la petición POST para confirmar una reserva específica.
        - `realize_id`: Es el ID de la reserva a confirmar (viene de la URL).
        """
        # El usuario que realiza la petición se obtiene del token.
        confirming_user = request.user

        # 1. Obtener la reserva que se quiere confirmar.
        try:
            reservation = Realize.objects.select_related('travel').get(id=realize_id)
        except Realize.DoesNotExist:
            return Response({"error": "La reserva especificada no existe."}, status=status.HTTP_404_NOT_FOUND)
        
        # 2. Verifica que el usuario autenticado sea el verdadero dueño de la reserva.
        if reservation.user != confirming_user:
            return Response({"error": "No tienes permiso para confirmar una reserva que no te pertenece."}, status=status.HTTP_403_FORBIDDEN)
        
        # 3. Validar que la reserva esté en estado 'pending'.
        if reservation.status != Realize.STATUS_PENDING:
            return Response({"error": f"No se puede confirmar esta reserva. Estado actual: {reservation.status}."}, status=status.HTTP_400_BAD_REQUEST)
            
        # 4. Cambiar el estado y guardar.
        reservation.status = Realize.STATUS_CONFIRMED
        reservation.save(update_fields=['status'])
        
        # 5. Devolver una respuesta de éxito.
        return Response({"success": f"Tu reserva para el viaje {reservation.travel.id} ha sido confirmada."}, status=status.HTTP_200_OK)