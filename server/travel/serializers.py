# vehicle/serializers.py
from rest_framework import serializers
from .models import Travel, Vehicle, Route, Driver
from rest_framework import serializers
from django.db.models import Avg, Count
from .models import Travel, Vehicle, Driver
from users.models import Users
from realize.models import Realize


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


class TravelInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Travel
        fields = ['id', 'vehicle', 'route', 'time', 'price', 'travel_state']

class VehicleSerializer(serializers.ModelSerializer):
    """Serializador para mostrar los detalles del vehículo."""
    class Meta:
        model = Vehicle
        fields = '__all__'
         # MODIFICADO: Añade un ref_name único para que drf-yasg no se confunda.
        # Este nombre es solo para la documentación interna de Swagger.
        ref_name = "TravelVehicleInfo"

class UserForDriverSerializer(serializers.ModelSerializer):
    """Serializador simple para mostrar la información del usuario dentro del Driver."""
    class Meta:
        model = Users
        fields = ['uid', 'full_name', 'uphone', 'institutional_mail']

class DriverSerializer(serializers.ModelSerializer):
    """Serializador para mostrar los detalles del conductor."""
    user = UserForDriverSerializer(read_only=True)
    class Meta:
        model = Driver
        fields = ['user', 'validate_state']

# --- Serializador Principal para la Lista de Viajes ---

class TravelDetailSerializer(serializers.ModelSerializer):
    """
    Serializador enriquecido para la lista de viajes de una institución.
    Incluye detalles del conductor, vehículo, y campos calculados.
    """
    # 1. Anidamos los serializadores para mostrar la información completa
    driver = DriverSerializer(read_only=True)
    vehicle = VehicleSerializer(read_only=True)
    
    # 2. Definimos los nuevos campos calculados
    driver_score = serializers.SerializerMethodField()
    available_seats = serializers.SerializerMethodField()

    class Meta:
        model = Travel
        fields = [
            'id', 
            'time', 
            'travel_state', 
            'price',
            'driver',         # Objeto anidado con info del conductor
            'vehicle',        # Objeto anidado con info del vehículo
            'driver_score',   # Nuevo campo calculado
            'available_seats' # Nuevo campo calculado
        ]

    def get_driver_score(self, obj):
        """
        Calcula el puntaje promedio del conductor del viaje.
        'obj' es la instancia del modelo Travel.
        """
        # Usamos la relación inversa desde Driver para acceder a todas sus calificaciones
        # y calculamos el promedio del campo 'score'.
        average = obj.driver.assessments.aggregate(Avg('score'))['score__avg']
        
        # Si el conductor no tiene calificaciones, devolvemos null o 0.
        if average is None:
            return None # o 0.0 si lo prefieres
            
        return round(average, 2) # Redondeamos a 2 decimales

    def get_available_seats(self, obj):
        """
        Calcula los asientos disponibles para el viaje.
        'obj' es la instancia del modelo Travel.
        """
        # Obtenemos la capacidad total del vehículo del viaje
        total_capacity = obj.vehicle.capacity
        
        # Contamos cuántas reservas confirmadas existen para este viaje
        confirmed_reservations = Realize.objects.filter(
            travel=obj,
            status=Realize.STATUS_CONFIRMED
        ).count()
        
        # La resta nos da los asientos disponibles
        return total_capacity - confirmed_reservations