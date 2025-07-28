# server/travel/serializers.py

from rest_framework import serializers
from django.db.models import Avg
from .models import Travel, Vehicle, Driver
from users.models import Users
from realize.models import Realize
from route.models import Route

# --- Serializadores existentes (sin cambios) ---
class TravelSerializer(serializers.ModelSerializer):
    driver = serializers.PrimaryKeyRelatedField(queryset=Driver.objects.all())
    vehicle = serializers.PrimaryKeyRelatedField(queryset=Vehicle.objects.all())
    route = serializers.PrimaryKeyRelatedField(queryset=Route.objects.all())
    class Meta:
        model = Travel
        fields = ['id', 'driver', 'vehicle', 'route', 'time', 'travel_state', 'price']
    def validate(self, data):
        driver = data.get('driver')
        vehicle = data.get('vehicle')
        if vehicle.driver_id != driver.user_id:
            raise serializers.ValidationError("Este vehículo no pertenece al conductor.")
        return data

class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = '__all__'
        ref_name = 'TravelRouteInfo'

class TravelInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Travel
        fields = ['id', 'vehicle', 'route', 'time', 'price', 'travel_state']

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'
        ref_name = "TravelVehicleInfo"

class UserForDriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['uid', 'full_name', 'uphone', 'institutional_mail']

class DriverSerializer(serializers.ModelSerializer):
    user = UserForDriverSerializer(read_only=True)
    class Meta:
        model = Driver
        fields = ['user', 'validate_state']

# --- ¡NUEVO SERIALIZADOR AÑADIDO! ---
class RealizeInfoSerializer(serializers.ModelSerializer):
    """
    Serializador para mostrar la información de una reserva (pasajero)
    dentro de la lista de detalles de un viaje.
    """
    user = UserForDriverSerializer(read_only=True)
    class Meta:
        model = Realize
        fields = ['id', 'user', 'status']

# --- SERIALIZADOR PRINCIPAL MODIFICADO ---
class TravelDetailSerializer(serializers.ModelSerializer):
    """
    Serializador enriquecido para la lista de viajes.
    Muestra condicionalmente la lista de reservaciones.
    """
    driver = DriverSerializer(read_only=True)
    vehicle = VehicleSerializer(read_only=True)
    route = RouteSerializer(read_only=True) 
    driver_score = serializers.SerializerMethodField()
    available_seats = serializers.SerializerMethodField()
    
    # Se declara el campo de reservaciones.
    reservations = RealizeInfoSerializer(many=True, read_only=True, source='realize')

    class Meta:
        model = Travel
        fields = [
            'id', 'time', 'travel_state', 'price',
            'driver', 'vehicle', 'route',
            'driver_score', 'available_seats',
            'reservations' # <-- El campo está aquí, pero se mostrará condicionalmente.
        ]
  
    def get_driver_score(self, obj):
        average = obj.driver.assessments.aggregate(Avg('score'))['score__avg']
        return round(average, 2) if average is not None else None

    def get_available_seats(self, obj):
        total_capacity = obj.vehicle.capacity
        confirmed_reservations = Realize.objects.filter(
            travel=obj,
            status=Realize.STATUS_CONFIRMED
        ).count()
        return total_capacity - confirmed_reservations

    def to_representation(self, instance):
        """
        Sobrescribe el método de serialización para añadir lógica condicional.
        Este método se llama para cada objeto `Travel` en la lista.
        """
        # Obtenemos la representación de datos estándar.
        ret = super().to_representation(instance)
        
        # Obtenemos el usuario que está haciendo la petición desde el contexto.
        user = self.context['request'].user
        
        # --- LÓGICA DE PERMISOS ---
        # Si el usuario NO es el conductor de este viaje específico (`instance`),
        # eliminamos el campo 'reservations' de la respuesta para ese viaje.
        if user != instance.driver.user:
            ret.pop('reservations', None)
            
        return ret