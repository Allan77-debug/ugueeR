from rest_framework import serializers
from .models import Route

class RouteSerializer(serializers.ModelSerializer):
    origin = serializers.CharField(required=True, allow_blank=False)
    destination = serializers.CharField(required=True, allow_blank=False)

    class Meta:
        model = Route
        fields = '__all__'