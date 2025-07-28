# vehicle/serializers.py
from rest_framework import serializers
from .models import Travel, Vehicle, Route, Driver
from rest_framework import serializers
from django.db.models import Avg, Count
from .models import Travel, Vehicle, Driver
from users.models import Users
from realize.models import Realize
from route.models import Route


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
    """Serializador para mostrar los detalles de la Ruta."""
    class Meta:
        model = Route
        fields = '__all__'
        ref_name = 'TravelRouteInfo'


class TravelInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Travel
        fields = ['id', 'vehicle', 'route', 'time', 'price', 'travel_state']

class VehicleSerializer(serializers.ModelSerializer):
    """Serializador para mostrar los detalles del vehículo."""
    class Meta:
        model = Vehicle
        fields = '__all__'
    
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



class TravelDetailSerializer(serializers.ModelSerializer):
    """
    Serializador enriquecido para la lista de viajes de una institución.
    Incluye detalles del conductor, vehículo, ruta y campos calculados.
    """
   
    driver = DriverSerializer(read_only=True)
    vehicle = VehicleSerializer(read_only=True)
    

    route = RouteSerializer(read_only=True) 
    
    
    driver_score = serializers.SerializerMethodField()
    available_seats = serializers.SerializerMethodField()

    class Meta:
        model = Travel
        fields = [
            'id', 
            'time', 
            'travel_state', 
            'price',
            'driver',         
            'vehicle',       
            'route',          
            'driver_score',   
            'available_seats'
        ]
  

    def get_driver_score(self, obj):
        average = obj.driver.assessments.aggregate(Avg('score'))['score__avg']
        if average is None:
            return None
        return round(average, 2)

    def get_available_seats(self, obj):

        total_capacity = obj.vehicle.capacity
        confirmed_reservations = Realize.objects.filter(
            travel=obj,
            status=Realize.STATUS_CONFIRMED
        ).count()
        return total_capacity - confirmed_reservations