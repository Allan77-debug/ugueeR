"""
Define los serializadores para la aplicación 'assessment'.

Estos serializadores convierten los objetos del modelo Assessment a formato JSON
y viceversa, facilitando su transmisión a través de la API y validando los datos de entrada.
"""
from rest_framework import serializers
from .models import Assessment

class AssessmentReadSerializer(serializers.ModelSerializer):
    """
    Serializador para la LECTURA de calificaciones.
    
    Muestra las relaciones (usuario, conductor, viaje) de forma legible
    utilizando su representación en cadena (__str__).
    """
    # Muestra el __str__ del modelo relacionado en lugar de solo su ID.
    user = serializers.StringRelatedField()
    driver = serializers.StringRelatedField()
    travel = serializers.StringRelatedField()

    class Meta:
        model = Assessment
        # Incluye todos los campos del modelo para una visualización completa.
        fields = ['id', 'travel', 'driver', 'user', 'score', 'comment']

class AssessmentCreateSerializer(serializers.ModelSerializer):
    """
    Serializador para la CREACIÓN de nuevas calificaciones.
    
    Solo expone los campos necesarios que el usuario debe proporcionar al crear
    una nueva calificación. El campo 'user' se asignará automáticamente desde la petición.
    """
    class Meta:
        model = Assessment
        # El usuario se asignará desde la vista, por lo que no se incluye aquí.
        fields = ['travel', 'driver', 'score', 'comment']

class AssessmentUpdateSerializer(serializers.ModelSerializer):
    """
    Serializador para la ACTUALIZACIÓN (parcial) de una calificación.
    
    Solo permite modificar la puntuación y el comentario, ya que el viaje,
    conductor y usuario no deberían cambiar una vez creada la calificación.
    """
    class Meta:
        model = Assessment
        # Solo los campos que un usuario puede editar después de crear la calificación.
        fields = ['score', 'comment']