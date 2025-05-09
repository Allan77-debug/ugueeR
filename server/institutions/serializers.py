from rest_framework import serializers
from .models import Institution
from django.contrib.auth.hashers import make_password


class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = [
            "id_institution",
            "official_name",
            "short_name",
            "email",
            "phone",
            "address",
            "city",
            "istate",
            "postal_code",
            "logo",
            "primary_color",
            "secondary_color",
            "status",
            "application_date",
        ]

    def validate_email(self, value):
        if Institution.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe una institución con este email.")
        return value

    def validate_phone(self, value):
        if Institution.objects.filter(phone=value).exists():
            raise serializers.ValidationError("Ya existe una institución con este número.")
        return value

    def create(self, validated_data):
        # Hashea la contraseña antes de guardar
        if "ipassword" in validated_data and validated_data["ipassword"]:
            validated_data["ipassword"] = make_password(validated_data["ipassword"])
        return super().create(validated_data)

class InstitutionDetailSerializer(serializers.ModelSerializer):
        class Meta:
            model = Institution
            fields = [
                "id_institution",
                "official_name",
                "short_name",
                "email",
                "phone",
                "address",
                "city",
                "istate",
                "postal_code",
                "logo",
                "primary_color",
                "secondary_color",
                "status",
                "application_date",
                "rejection_reason",
            ]
