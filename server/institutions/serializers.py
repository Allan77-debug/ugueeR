from rest_framework import serializers
from .models import Institution
from django.contrib.auth.hashers import make_password


class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = '__all__'

    def create(self, validated_data):
        # Hashea la contraseña antes de guardar
        if 'ipassword' in validated_data and validated_data['ipassword']:
            validated_data['ipassword'] = make_password(validated_data['ipassword'])
        return super().create(validated_data)
