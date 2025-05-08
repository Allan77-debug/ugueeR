from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Users


class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = '__all__'

    def create(self, validated_data):
        # Hashea la contraseña antes de guardar
        validated_data['upassword'] = make_password(validated_data['upassword'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Si se está actualizando la contraseña, también la hashea
        if 'upassword' in validated_data:
            validated_data['upassword'] = make_password(validated_data['upassword'])
        return super().update(instance, validated_data)
