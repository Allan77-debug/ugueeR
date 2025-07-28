# server/institutions/serializers.py

from rest_framework import serializers
from .models import Institution
from users.models import Users
from users.serializers import UsersSerializer
from django.contrib.auth.hashers import make_password

class InstitutionSerializer(serializers.ModelSerializer):
    """Serializador para crear (registrar) y actualizar una institución."""
    class Meta:
        model = Institution
        # Define los campos del modelo que se incluirán en la serialización.
        fields = [
            "id_institution", "official_name", "short_name", "email",
            "phone", "address", "city", "istate", "ipassword",
            "postal_code", "logo", "primary_color", "secondary_color",
            "status", "application_date",
        ]

    def validate_email(self, value):
        """Valida que el email de la institución no esté ya en uso."""
        if Institution.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe una institución con este correo.")
        return value

    def validate_phone(self, value):
        """Valida que el teléfono de la institución no esté ya en uso."""
        if Institution.objects.filter(phone=value).exists():
            raise serializers.ValidationError("Ya existe una institución con este número.")
        return value

    def create(self, validated_data):
        """
        Sobrescribe el método de creación estándar para hashear la contraseña
        antes de guardarla en la base de datos, por seguridad.
        """
        if "ipassword" in validated_data and validated_data["ipassword"]:
            validated_data["ipassword"] = make_password(validated_data["ipassword"])
        return super().create(validated_data)

class InstitutionDetailSerializer(serializers.ModelSerializer):
    """
    Serializador para mostrar los detalles de una institución.
    Excluye campos sensibles como la contraseña.
    """
    class Meta:
        model = Institution
        fields = [
            "id_institution", "official_name", "short_name", "email",
            "phone", "address", "city", "istate", "postal_code",
            "logo", "primary_color", "secondary_color", "status",
            "application_date", "rejection_reason",
        ]

class InstitutionLoginSerializer(serializers.Serializer):
    """
    Serializador específico para validar los datos de login de una institución.
    No está ligado a un modelo, solo define los campos esperados.
    """
    email = serializers.EmailField()
    ipassword = serializers.CharField(write_only=True) # `write_only` evita que la contraseña se muestre en respuestas.

class DriverInfoSerializer(serializers.ModelSerializer):
    """
    Serializador para mostrar información básica de un usuario-conductor.
    Utilizado para listar solicitudes de conductor.
    """
    class Meta:
        model = Users
        fields = ['uid', 'full_name', 'user_type', 'institutional_mail', 'udocument', 'institutional_carne']