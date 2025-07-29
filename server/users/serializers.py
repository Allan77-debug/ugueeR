from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Users
from institutions.models import Institution

class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = '__all__'
        extra_kwargs = {
            'institution_id': {'read_only': True}
        }

    def validate_institutional_mail(self, value):
        # Obtener dominio del correo
        try:
            domain = value.split("@")[1]
        except IndexError:
            raise serializers.ValidationError("Correo institucional inválido.")


        institution = Institution.objects.filter(email__icontains=domain).first()
        if not institution:
            raise serializers.ValidationError("No se encontró una institución asociada a este correo.")

        self.context['matched_institution_id'] = institution.id_institution
        return value

        
    def create(self, validated_data):
        validated_data['upassword'] = make_password(validated_data['upassword'])

        # Usamos la institución encontrada en el validador
        validated_data['institution_id'] = self.context.get('matched_institution_id')

        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Si se está actualizando la contraseña, también la hashea
        if 'upassword' in validated_data:
            validated_data['upassword'] = make_password(validated_data['upassword'])
        return super().update(instance, validated_data)

class UsersLoginSerializer(serializers.Serializer):
    institutional_mail = serializers.EmailField()
    upassword = serializers.CharField(write_only=True)

class DriverApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['driver_state'] 


class UsersProfileSerializer(serializers.ModelSerializer):
    institution_name = serializers.SerializerMethodField()
    class Meta:
        model = Users
        fields = ["uid", "full_name", "user_type", "institutional_mail", "student_code", "institution_name", "driver_state"]
    def get_institution_name(self, obj):
        return obj.institution.official_name if obj.institution else None
