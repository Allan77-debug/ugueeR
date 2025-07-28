# server/users/serializers.py
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Users
from institutions.models import Institution

class UsersSerializer(serializers.ModelSerializer):
    """
    Serializador para el registro y actualización de usuarios.
    """
    class Meta:
        model = Users
        fields = '__all__' # Incluye todos los campos del modelo.
        # `extra_kwargs` permite configurar opciones adicionales para los campos.
        # Hacemos que la contraseña sea de solo escritura para que no se devuelva en las respuestas.
        extra_kwargs = {
            'upassword': {'write_only': True} 
        }

    def validate_institutional_mail(self, value):
        """
        Validador personalizado para el correo institucional.

        1. Extrae el dominio del correo (ej: 'universidad.edu').
        2. Busca en la base de datos una institución cuyo correo contenga ese dominio.
        3. Si no encuentra una institución, lanza un error de validación.
        4. Si la encuentra, guarda el ID de la institución en el contexto del serializador
           para usarlo más tarde en el método `create`.
        """
        try:
            domain = value.split("@")[1]
        except IndexError:
            raise serializers.ValidationError("Formato de correo institucional inválido.")

        # Busca una institución que coincida con el dominio del correo.
        institution = Institution.objects.filter(email__icontains=domain).first()
        if not institution:
            raise serializers.ValidationError("No se encontró una institución asociada a este dominio de correo.")

        # Guarda el ID de la institución encontrada para usarlo en `create`.
        self.context['matched_institution_id'] = institution.id_institution
        return value

    def create(self, validated_data):
        """
        Sobrescribe el método `create` para hashear la contraseña y asignar la institución.
        """
        # Hashea la contraseña antes de guardarla en la base de datos.
        validated_data['upassword'] = make_password(validated_data['upassword'])

        # Asigna el ID de la institución que se encontró en el método de validación.
        validated_data['institution_id'] = self.context.get('matched_institution_id')

        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Sobrescribe el método `update` para hashear la contraseña si se está actualizando.
        """
        if 'upassword' in validated_data:
            validated_data['upassword'] = make_password(validated_data['upassword'])
        return super().update(instance, validated_data)

class UsersLoginSerializer(serializers.Serializer):
    """
    Serializador simple para validar los datos de inicio de sesión.
    No está asociado a un modelo, solo define los campos esperados.
    """
    institutional_mail = serializers.EmailField()
    upassword = serializers.CharField(write_only=True) # La contraseña es solo de entrada.

class DriverApplicationSerializer(serializers.ModelSerializer):
    """
    Serializador específico para manejar la solicitud de un usuario para ser conductor.
    Solo expone el campo `driver_state` para su modificación.
    """
    class Meta:
        model = Users
        fields = ['driver_state']

class UsersProfileSerializer(serializers.ModelSerializer):
    """
    Serializador de solo lectura para mostrar el perfil público de un usuario.
    """
    # Campo calculado que obtiene el nombre de la institución.
    institution_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Users
        # Define los campos específicos que se mostrarán en el perfil.
        fields = ["uid", "full_name", "user_type", "institutional_mail", "student_code", "institution_name", "driver_state"]
        
    def get_institution_name(self, obj):
        """
        Devuelve el nombre oficial de la institución del usuario.
        `obj` es la instancia del modelo `Users` que se está serializando.
        """
        return obj.institution.official_name if obj.institution else None