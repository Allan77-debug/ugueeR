from rest_framework import serializers
from .models import Route

class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = [
            'id',
            'driver',  # <- ¡Este debe estar!
            'startLocation',
            'destination',
            'startPointCoords',
            'endPointCoords'
        ]
        