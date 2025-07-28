# server/realize/serializers.py

from rest_framework import serializers
from .models import Realize, Users, Travel 

class RealizeSerializer(serializers.ModelSerializer):
    """
    Serializador principal para el modelo Realize.
    Se utiliza para listar, recuperar y actualizar (PATCH/PUT) reservas.
    Permite la visualización del 'status' y su modificación en operaciones de actualización.
    """
    # Campo de solo lectura para el ID de la reserva.
    id = serializers.IntegerField(read_only=True)
    
    # Campo para la entrada de datos, representa el viaje a reservar.
    # `source='travel'` le dice a DRF que este campo se mapea al campo 'travel' del modelo.
    id_travel = serializers.PrimaryKeyRelatedField(queryset=Travel.objects.all(), source='travel')
    
    # Campo de solo lectura para el UID del usuario, obtenido a través de la relación.
    uid = serializers.IntegerField(source='user.uid', read_only=True)
    
    # Campo de solo lectura para el ID del viaje, obtenido a través de la relación.
    travelid = serializers.IntegerField(source='travel.id', read_only=True)

    class Meta:
        model = Realize
        fields = ['id', 'uid', 'id_travel', 'travelid', 'status']
        # Define qué campos no se pueden modificar directamente a través de este serializador.
        read_only_fields = ['id', 'uid', 'travelid']

    def validate(self, data):
        """
        Realiza validaciones para la creación y actualización de reservas.
        """
        request = self.context.get('request')

        if not request or not hasattr(request, 'user') or not request.user:
            raise serializers.ValidationError("No se pudo obtener el usuario autenticado.")

        reserving_user = request.user
        travel = data.get('travel') 

        # --- Validaciones para la creación (POST) ---
        if request.method == 'POST':
            if 'status' in data:
                raise serializers.ValidationError({"status": "El estado de la reserva no puede ser especificado en la creación; siempre es 'pending'."})

            if not travel:
                raise serializers.ValidationError({"id_travel": "El ID del viaje es requerido."})

            if Realize.objects.filter(user=reserving_user, travel=travel).exists():
                raise serializers.ValidationError("Ya tienes una reserva para este viaje.")

            # Valida que el viaje esté 'scheduled' o 'in_progress'.
            if travel.travel_state not in [Travel.TRAVEL_STATES[0][0], Travel.TRAVEL_STATES[1][0]]:
                current_travel_state_display = next(
                    (display for value, display in Travel.TRAVEL_STATES if value == travel.travel_state),
                    travel.travel_state
                )
                raise serializers.ValidationError({"id_travel": f"No se puede reservar un viaje en estado '{current_travel_state_display}'."})

            # Valida que el usuario y el conductor pertenezcan a la misma institución.
            driver_of_travel_user = travel.driver.user
            if not driver_of_travel_user.institution or not reserving_user.institution:
                raise serializers.ValidationError({"institution_error": "Información de institución faltante para el conductor o el usuario."})

            if reserving_user.institution.id_institution != driver_of_travel_user.institution.id_institution:
                raise serializers.ValidationError(
                    {"institution_mismatch": "Solo puedes reservar viajes ofrecidos por conductores de tu misma institución."}
                )

            # Asigna el usuario de la petición a la reserva.
            data['user'] = reserving_user

        # --- Validaciones para la actualización (PUT/PATCH) ---
        elif request.method in ['PUT', 'PATCH']:
            if 'status' not in data:
                if self.context.get('view') and self.context['view'].__class__.__name__ == 'RealizeCancelView':
                    raise serializers.ValidationError({"detail": "Se requiere el campo 'status' para cancelar la reserva."})

            elif data['status'] == Realize.STATUS_CANCELLED:
                instance = self.instance # La reserva que se está actualizando.
                
                # Un usuario solo puede cancelar su propia reserva (a menos que sea admin).
                if instance.user != reserving_user and reserving_user.user_type != Users.TYPE_ADMIN:
                    raise serializers.ValidationError({"status": "No tienes permiso para cancelar esta reserva."})

                if instance.status == Realize.STATUS_CANCELLED:
                    raise serializers.ValidationError({"status": "Esta reserva ya ha sido cancelada."})
            else:
                # Si se intenta cambiar el estado a algo que no sea 'cancelled' a través de la vista de cancelación.
                if self.context.get('view') and self.context['view'].__class__.__name__ == 'RealizeCancelView':
                    raise serializers.ValidationError({"status": "Solo se permite cambiar el estado a 'cancelled' mediante esta URL de cancelación."})

        return data

class RealizeCreateSerializer(serializers.ModelSerializer):
    """
    Serializador específico para la creación de nuevas reservas.
    """
    id_travel = serializers.PrimaryKeyRelatedField(queryset=Travel.objects.all(), source='travel', write_only=True)
    uid = serializers.IntegerField(source='user.uid', read_only=True)
    id = serializers.IntegerField(read_only=True) 
    travel_id = serializers.IntegerField(source='travel.id', read_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = Realize
        fields = ['id', 'uid', 'id_travel', 'travel_id', 'status']
        read_only_fields = ['id', 'uid', 'travel_id', 'status'] 

    def create(self, validated_data):
        return Realize.objects.create(**validated_data)

    def validate(self, data):
        """
        Realiza validaciones específicas para la creación de una nueva reserva.
        """
        request = self.context.get('request')
        if not request or not hasattr(request, 'user') or not request.user:
            raise serializers.ValidationError("No se pudo obtener el usuario autenticado.")

        reserving_user = request.user
        travel = data.get('travel') 

        if not travel:
            raise serializers.ValidationError({"id_travel": "El ID del viaje es requerido."})

        # --- ¡CAMBIO CLAVE EN LA LÓGICA DE RESERVA! ---
        # Ahora, una reserva solo es válida si el estado del viaje es 'scheduled'.
        if travel.travel_state != 'scheduled':
            raise serializers.ValidationError({
                "id_travel": f"No se puede reservar este viaje. Solo se admiten viajes en estado 'Programado'."
            })
        
        # El resto de las validaciones se mantienen.
        if Realize.objects.filter(user=reserving_user, travel=travel).exists():
            raise serializers.ValidationError("Ya tienes una reserva para este viaje.")
        
        driver_of_travel_user = travel.driver.user
        if not driver_of_travel_user.institution or not reserving_user.institution:
            raise serializers.ValidationError({"institution_error": "Información de institución faltante."})
        if reserving_user.institution.id_institution != driver_of_travel_user.institution.id_institution:
            raise serializers.ValidationError({"institution_mismatch": "Solo puedes reservar viajes de tu misma institución."})

        data['user'] = reserving_user
        return data