# server/vehicle/serializers.py
from rest_framework import serializers
from .models import Vehicle

class VehicleSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Vehicle.

    Se encarga de convertir las instancias del modelo Vehicle a formato JSON
    y viceversa. También maneja las validaciones a nivel de campo.
    """
    class Meta:
        model = Vehicle
        # Incluye todos los campos del modelo en la serialización.
        fields = '__all__'
        # Define campos que serán de solo lectura. El conductor se asigna
        # automáticamente en la vista, no se debe enviar en el cuerpo de la petición.
        read_only_fields = ('driver',)
        # Asigna un nombre de referencia para evitar conflictos en la generación de esquemas de Swagger/OpenAPI.
        ref_name = "VehicleBase"

