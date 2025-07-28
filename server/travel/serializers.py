# server/travel/serializers.py
from rest_framework import serializers
from django.db.models import Avg
from .models import Travel
from vehicle.models import Vehicle
from driver.models import Driver
from users.models import Users
from realize.models import Realize
from route.models import Route

class TravelSerializer(serializers.ModelSerializer):
    """
    Serializador para crear y actualizar instancias de Travel.
    Utiliza claves primarias para las relaciones, esperando IDs en la entrada.
    """
    # Campo para el conductor, espera un ID (clave primaria) de un objeto Driver existente.
    driver = serializers.PrimaryKeyRelatedField(queryset=Driver.objects.all())
    # Campo para el vehículo, espera un ID de un objeto Vehicle existente.
    vehicle = serializers.PrimaryKeyRelatedField(queryset=Vehicle.objects.all())
    # Campo para la ruta, espera un ID de un objeto Route existente.
    route = serializers.PrimaryKeyRelatedField(queryset=Route.objects.all())
    
    class Meta:
        model = Travel
        # Define los campos que se incluirán en la serialización.
        fields = ['id', 'driver', 'vehicle', 'route', 'time', 'travel_state', 'price']

    def validate(self, data):
        """
        Validación a nivel de objeto.
        Se ejecuta después de la validación de cada campo individual.
        Asegura que el vehículo seleccionado pertenezca al conductor especificado.
        """
        driver = data.get('driver')
        vehicle = data.get('vehicle')
        # La validación se realiza solo si ambos campos están presentes en los datos de entrada.
        if driver and vehicle:
            if vehicle.driver != driver:
                # Si el vehículo no pertenece al conductor, lanza un error de validación.
                raise serializers.ValidationError("Este vehículo no pertenece al conductor.")
        return data

class RouteSerializer(serializers.ModelSerializer):
    """Serializador simple para el modelo Route, utilizado para anidamiento en otras respuestas."""
    class Meta:
        model = Route
        fields = '__all__' # Incluye todos los campos del modelo Route.
        ref_name = 'TravelRouteInfo' # Evita conflictos de nombres en la documentación de Swagger/OpenAPI.

class TravelInfoSerializer(serializers.ModelSerializer):
    """Serializador para mostrar información básica de un viaje."""
    class Meta:
        model = Travel
        fields = ['id', 'vehicle', 'route', 'time', 'price', 'travel_state']

class VehicleSerializer(serializers.ModelSerializer):
    """Serializador simple para el modelo Vehicle, utilizado para anidamiento."""
    class Meta:
        model = Vehicle
        fields = '__all__' # Incluye todos los campos del modelo Vehicle.
        ref_name = "TravelVehicleInfo" # Evita conflictos de nombres en Swagger.

class UserForDriverSerializer(serializers.ModelSerializer):
    """Serializador para mostrar información pública de un usuario, usualmente para anidar."""
    class Meta:
        model = Users
        # Define los campos específicos y públicos que se van a mostrar.
        fields = ['uid', 'full_name', 'uphone', 'institutional_mail']

class DriverSerializer(serializers.ModelSerializer):
    """Serializador para mostrar información de un conductor, anidando los datos de su usuario asociado."""
    # Anida el serializador de usuario para mostrar detalles del usuario en lugar de solo su ID.
    user = UserForDriverSerializer(read_only=True)
    class Meta:
        model = Driver
        fields = ['user', 'validate_state']

class RealizeInfoSerializer(serializers.ModelSerializer):
    """
    Serializador para mostrar la información de una reserva (realize) de un pasajero
    dentro de la lista de detalles de un viaje.
    """
    # Anida la información del usuario que hizo la reserva.
    user = UserForDriverSerializer(read_only=True)
    class Meta:
        model = Realize
        fields = ['id', 'user', 'status']

class TravelDetailSerializer(serializers.ModelSerializer):
    """
    Serializador enriquecido para la lista de viajes.
    Muestra información detallada y anidada del viaje, conductor, vehículo y ruta.
    Calcula campos dinámicamente y muestra la lista de reservaciones condicionalmente.
    """
    # Anida la información completa del conductor.
    driver = DriverSerializer(read_only=True)
    # Anida la información completa del vehículo.
    vehicle = VehicleSerializer(read_only=True)
    # Anida la información completa de la ruta.
    route = RouteSerializer(read_only=True) 
    # Campo calculado para obtener el puntaje promedio del conductor.
    driver_score = serializers.SerializerMethodField()
    # Campo calculado para obtener los asientos disponibles.
    available_seats = serializers.SerializerMethodField()
    
    # Campo para anidar la lista de reservaciones. `source='realize'` utiliza la
    # relación inversa del modelo Realize (related_name='realize' o por defecto 'realize_set').
    reservations = RealizeInfoSerializer(many=True, read_only=True, source='realize')

    class Meta:
        model = Travel
        fields = [
            'id', 'time', 'travel_state', 'price',
            'driver', 'vehicle', 'route',
            'driver_score', 'available_seats',
            'reservations' # <-- El campo se incluye aquí, pero se mostrará condicionalmente.
        ]
  
    def get_driver_score(self, obj):
        """
        Calcula el puntaje promedio del conductor del viaje.
        `obj` es la instancia de Travel que se está serializando.
        """
        # Realiza una agregación en la base de datos para calcular el promedio de las puntuaciones.
        average = obj.driver.assessments.aggregate(Avg('score'))['score__avg']
        # Devuelve el promedio redondeado a 2 decimales, o None si no hay calificaciones.
        return round(average, 2) if average is not None else None

    def get_available_seats(self, obj):
        """
        Calcula los asientos disponibles restando las reservas confirmadas de la capacidad del vehículo.
        `obj` es la instancia de Travel.
        """
        total_capacity = obj.vehicle.capacity
        # Cuenta cuántas reservaciones (Realize) para este viaje tienen el estado 'confirmado'.
        confirmed_reservations = Realize.objects.filter(
            travel=obj,
            status=Realize.STATUS_CONFIRMED
        ).count()
        return total_capacity - confirmed_reservations

    def to_representation(self, instance):
        """
        Sobrescribe el método de serialización para añadir lógica condicional.
        Este método se llama para cada objeto `Travel` que se serializa.
        """
        # Obtenemos la representación de datos estándar del serializador padre.
        ret = super().to_representation(instance)
        
        # Obtenemos el usuario que está haciendo la petición desde el contexto del serializador.
        request = self.context.get('request')
        if not request:
            return ret
        user = request.user
        
        # --- LÓGICA DE PERMISOS ---
        # Si el usuario que solicita NO es el conductor de este viaje específico (`instance`),
        # eliminamos el campo 'reservations' de la respuesta JSON para ese viaje.
        if user != instance.driver.user:
            ret.pop('reservations', None)
            
        return ret

class DriverTravelWithReservationsSerializer(serializers.ModelSerializer):
    """
    Serializador para listar los viajes de un conductor, incluyendo siempre
    una lista anidada de todas las reservaciones para cada viaje.
    """
    # Anida la lista de reservaciones de forma incondicional.
    reservations = RealizeInfoSerializer(many=True, read_only=True, source='realize')
    # También anida detalles del vehículo y la ruta para tener toda la información.
    vehicle = VehicleSerializer(read_only=True)
    route = RouteSerializer(read_only=True)

    class Meta:
        model = Travel
        fields = [
            'id', 'time', 'travel_state', 'price',
            'vehicle', 'route', 'reservations'
        ]