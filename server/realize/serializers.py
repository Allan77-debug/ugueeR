from rest_framework import serializers
from .models import Realize, Users, Travel # Asegúrate de que estas importaciones sean correctas

class RealizeSerializer(serializers.ModelSerializer):
    """
    Serializador principal para el modelo Realize.
    Se utiliza para listar, recuperar y actualizar (PATCH/PUT) reservas.
    Permite la visualización del 'status' y su modificación en operaciones de actualización.
    """
    id = serializers.IntegerField(read_only=True)
    # id_travel se usa para la entrada (write_only) y se mapea al campo 'travel' del modelo.
    id_travel = serializers.PrimaryKeyRelatedField(queryset=Travel.objects.all(), source='travel', write_only=True)
    # uid se usa para la salida (read_only) y se mapea al uid del usuario relacionado.
    uid = serializers.IntegerField(source='user.uid', read_only=True)

    class Meta:
        model = Realize
        # Incluye 'status' para que pueda ser leído y actualizado (en PATCH).
        fields = ['id', 'uid', 'id_travel', 'status']
        # 'id' y 'uid' siempre son de solo lectura para evitar que el cliente los modifique.
        read_only_fields = ['id', 'uid']

    def validate(self, data):
        """
        Realiza validaciones para la creación y actualización de reservas.
        Este método maneja las validaciones generales que aplican a ambas operaciones,
        pero se enfoca más en las validaciones de actualización/cancelación cuando
        se usa este serializador.
        """
        request = self.context.get('request')

        if not request or not hasattr(request, 'user') or not request.user:
            raise serializers.ValidationError("No se pudo obtener el usuario autenticado.")

        reserving_user = request.user
        travel = data.get('travel') # Obtiene el objeto Travel si se proporcionó id_travel

        # Validaciones para la creación (POST)
        # Aunque RealizeCreateSerializer manejará la mayoría de los casos de POST,
        # estas validaciones actúan como una capa de seguridad adicional si 'status'
        # se envía inesperadamente, o si este serializador se usa en un contexto POST.
        if request.method == 'POST':
            if 'status' in data:
                raise serializers.ValidationError({"status": "El estado de la reserva no puede ser especificado en la creación; siempre es 'pending'."})

            if not travel:
                raise serializers.ValidationError({"id_travel": "El ID del viaje es requerido."})

            if Realize.objects.filter(user=reserving_user, travel=travel).exists():
                raise serializers.ValidationError("Ya tienes una reserva para este viaje.")

            # Verifica el estado del viaje
            if travel.travel_state not in [Travel.TRAVEL_STATES[0][0], Travel.TRAVEL_STATES[1][0]]:
                current_travel_state_display = next(
                    (display for value, display in Travel.TRAVEL_STATES if value == travel.travel_state),
                    travel.travel_state
                )
                raise serializers.ValidationError({"id_travel": f"No se puede reservar un viaje en estado '{current_travel_state_display}'."})

            # Verifica la institución del conductor y del usuario
            driver_of_travel_user = travel.driver.user

            if not driver_of_travel_user.institution or not reserving_user.institution:
                raise serializers.ValidationError({"institution_error": "Información de institución faltante para el conductor o el usuario."})

            if reserving_user.institution.id_institution != driver_of_travel_user.institution.id_institution:
                raise serializers.ValidationError(
                    {"institution_mismatch": "Solo puedes reservar viajes ofrecidos por conductores de tu misma institución."}
                )

            # Agrega el usuario al diccionario de datos validados para que perform_create lo guarde
            data['user'] = reserving_user

        # Validaciones para actualización (PATCH/PUT) - Principalmente para la cancelación
        elif request.method in ['PUT', 'PATCH']:
            # Si se intenta actualizar pero no se envía el campo 'status'
            if 'status' not in data:
                # Específicamente para la vista de cancelación, el 'status' es obligatorio
                if self.context.get('view') and self.context['view'].__class__.__name__ == 'RealizeCancelView':
                    raise serializers.ValidationError({"detail": "Se requiere el campo 'status' para cancelar la reserva."})
            # Si se intenta cambiar el estado a 'cancelled'
            elif data['status'] == Realize.STATUS_CANCELLED:
                instance = self.instance # La instancia actual de la reserva que se está actualizando

                # Permiso para cancelar: solo el usuario que hizo la reserva o un admin
                if instance.user != reserving_user and reserving_user.user_type != Users.TYPE_ADMIN:
                    raise serializers.ValidationError({"status": "No tienes permiso para cancelar esta reserva."})

                # Evitar cancelar una reserva ya cancelada
                if instance.status == Realize.STATUS_CANCELLED:
                    raise serializers.ValidationError({"status": "Esta reserva ya ha sido cancelada."})
            # Si se intenta cambiar a otro estado que no sea 'cancelled' en la vista de cancelación
            else:
                if self.context.get('view') and self.context['view'].__class__.__name__ == 'RealizeCancelView':
                    raise serializers.ValidationError({"status": "Solo se permite cambiar el estado a 'cancelled' mediante esta URL de cancelación."})

        return data

class RealizeCreateSerializer(serializers.ModelSerializer):
    """
    Serializador específico para la creación de nuevas reservas.
    Este serializador NO incluye el campo 'status' en sus 'fields',
    asegurando que el cliente no lo envíe y que el modelo use su valor por defecto ('pending').
    """
    # id_travel se usa para la entrada (write_only) y se mapea al campo 'travel' del modelo.
    id_travel = serializers.PrimaryKeyRelatedField(queryset=Travel.objects.all(), source='travel', write_only=True)
    # uid se usa para la salida (read_only) y se mapea al uid del usuario relacionado.
    uid = serializers.IntegerField(source='user.uid', read_only=True)
    id = serializers.IntegerField(read_only=True) # También de solo lectura para la salida

    class Meta:
        model = Realize
        # Excluye 'status' de los campos de entrada para la creación.
        # Esto hace que no se pida en el JSON de entrada y que el modelo use su valor por defecto.
        fields = ['id', 'uid', 'id_travel']
        read_only_fields = ['id', 'uid'] # 'status' es implícitamente read-only porque no está en 'fields'

    def create(self, validated_data):
        """
        Método de creación para RealizeCreateSerializer.
        El campo 'status' no estará en validated_data, por lo que el modelo
        asignará automáticamente su valor por defecto ('pending').
        """
        return Realize.objects.create(**validated_data)

    def validate(self, data):
        """
        Realiza validaciones específicas para la creación de reservas.
        Similar a las validaciones de POST en RealizeSerializer, pero adaptadas
        para este serializador de creación.
        """
        request = self.context.get('request')

        if not request or not hasattr(request, 'user') or not request.user:
            raise serializers.ValidationError("No se pudo obtener el usuario autenticado.")

        reserving_user = request.user
        travel = data.get('travel') # Obtiene el objeto Travel si se proporcionó id_travel

        # Asegurarse de que 'status' no se envíe en la creación (aunque ya no esté en los campos)
        if 'status' in data:
            raise serializers.ValidationError({"status": "El estado de la reserva no puede ser especificado en la creación; siempre es 'pending'."})

        if not travel:
            raise serializers.ValidationError({"id_travel": "El ID del viaje es requerido."})

        # Verifica si el usuario ya tiene una reserva para este viaje
        if Realize.objects.filter(user=reserving_user, travel=travel).exists():
            raise serializers.ValidationError("Ya tienes una reserva para este viaje.")

        # Verifica el estado del viaje (solo se puede reservar si está 'active' o 'pending')
        if travel.travel_state not in [Travel.TRAVEL_STATES[0][0], Travel.TRAVEL_STATES[1][0]]:
            current_travel_state_display = next(
                (display for value, display in Travel.TRAVEL_STATES if value == travel.travel_state),
                travel.travel_state
            )
            raise serializers.ValidationError({"id_travel": f"No se puede reservar un viaje en estado '{current_travel_state_display}'."})

        # Verifica la institución del conductor y del usuario
        driver_of_travel_user = travel.driver.user

        if not driver_of_travel_user.institution or not reserving_user.institution:
            raise serializers.ValidationError({"institution_error": "Información de institución faltante para el conductor o el usuario."})

        if reserving_user.institution.id_institution != driver_of_travel_user.institution.id_institution:
            raise serializers.ValidationError(
                {"institution_mismatch": "Solo puedes reservar viajes ofrecidos por conductores de tu misma institución."}
            )

        # Agrega el usuario al diccionario de datos validados para que perform_create lo guarde
        data['user'] = reserving_user

        return data