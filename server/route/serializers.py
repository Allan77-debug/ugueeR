# server/route/serializers.py

from rest_framework import serializers
from .models import Route

class RouteSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Route.
    
    Convierte los objetos Route a formato JSON para ser utilizados en la API,
    y viceversa para la creación y actualización.
    """
    class Meta:
        # El modelo al que está asociado este serializador.
        model = Route
        
        # Lista de campos del modelo que se incluirán en la serialización.
        fields = [
            'id',
            'driver',
            'startLocation',
            'destination',
            'startPointCoords',
            'endPointCoords'
        ]