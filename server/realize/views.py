from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError
from .models import Realize
from .serializers import RealizeSerializer, RealizeCreateSerializer # Importa el nuevo serializador
from users.permissions import IsAuthenticatedCustom
from users.models import Users

class UserRealizeListView(generics.ListAPIView):
    """
    Vista para listar las reservas de un usuario.
    Los usuarios admin pueden ver todas las reservas; otros usuarios solo ven las suyas.
    """
    serializer_class = RealizeSerializer
    permission_classes = [IsAuthenticatedCustom]

    def get_queryset(self):
        """
        Define el queryset base para las reservas, filtrando por usuario si no es admin.
        """
        user = self.request.user
        # Selecciona relaciones para optimizar consultas a la base de datos
        base_queryset = Realize.objects.all().select_related(
            'user',
            'travel__driver__user__institution'
        )

        # Si el usuario es admin, devuelve todas las reservas
        if user.user_type == Users.TYPE_ADMIN:
            return base_queryset

        # Para otros tipos de usuario, filtra por el usuario actual
        return base_queryset.filter(user=user)

class RealizeCreateView(generics.CreateAPIView):
    """
    Vista para crear una nueva reserva.
    Ahora verifica la disponibilidad de asientos.
    """
    serializer_class = RealizeCreateSerializer
    permission_classes = [IsAuthenticatedCustom]

    def perform_create(self, serializer):
        # Primero validamos la disponibilidad antes de guardar
        travel_instance = serializer.validated_data.get('travel')
        
        if travel_instance:
            # Reutilizamos la misma lógica de cálculo
            capacity = travel_instance.vehicle.capacity
            confirmed_reservations = Realize.objects.filter(
                travel=travel_instance,
                status=Realize.STATUS_CONFIRMED
            ).count()
            
            available_seats = capacity - confirmed_reservations
            
            if available_seats <= 0:
                # Si no hay asientos, lanzamos un error de validación.
                # DRF lo convertirá en una respuesta 400 Bad Request.
                raise ValidationError("No hay asientos disponibles para este viaje.")

        # Si hay asientos, procedemos a guardar la reserva
        serializer.save(user=self.request.user)

class RealizeCancelView(generics.UpdateAPIView):
    """
    Vista para cancelar una reserva específica usando el ID autogenerado de la reserva (pk).
    Solo permite cambiar el estado a 'cancelled'.
    """
    queryset = Realize.objects.all() # DRF usa esto para get_object(pk=self.kwargs['pk'])
    serializer_class = RealizeSerializer # Usa el serializador principal para la actualización
    permission_classes = [IsAuthenticatedCustom]
    http_method_names = ['patch'] # Solo permite el método PATCH para esta operación

    def patch(self, request, *args, **kwargs):
        """
        Maneja la solicitud PATCH para cancelar una reserva.
        Valida que el campo 'status' se envíe y sea 'cancelled'.
        """
        instance = self.get_object() # Obtiene la instancia de la reserva usando el pk de la URL

        # Valida que 'status' esté presente en los datos de la solicitud y que su valor sea 'cancelled'
        if 'status' not in request.data or request.data['status'] != Realize.STATUS_CANCELLED:
            return Response(
                {"detail": "Solo se permite cambiar el estado a 'cancelled' mediante esta URL y debe incluir el campo 'status'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Pasa la instancia y los datos al serializador para la validación y guardado parcial
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True) # Lanza una excepción si los datos no son válidos
        serializer.save() # Guarda los cambios en la instancia

        return Response(serializer.data) # Devuelve los datos de la reserva actualizada
