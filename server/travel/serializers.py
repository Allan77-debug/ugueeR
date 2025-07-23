# vehicle/serializers.py
from rest_framework import serializers
from .models import Travel, Vehicle, Route, Driver


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