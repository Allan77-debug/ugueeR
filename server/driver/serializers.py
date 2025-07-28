from rest_framework import serializers
from .models import Driver

class DriverSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Driver.

    Convierte los objetos del modelo Driver a formato JSON para ser utilizados en la API,
    y viceversa (valida y convierte JSON a objetos de modelo).
    """
    class Meta:
        model = Driver
        # '__all__' indica que se deben incluir todos los campos del modelo en la serialización.
        fields = '__all__'