"""
Define las vistas y la lógica de la API para la aplicación 'assessment'.

Estas vistas manejan la creación, lectura, actualización y eliminación de
calificaciones (valoraciones) de los viajes.
"""
from rest_framework import generics, status 
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import IntegrityError
from django.shortcuts import get_object_or_404

from .models import Assessment
from .permissions import IsOwner
from users.permissions import IsAuthenticatedCustom

from .serializers import (
    AssessmentReadSerializer, 
    AssessmentCreateSerializer,
    AssessmentUpdateSerializer
)


class AssessmentCreateView(generics.CreateAPIView):
    """
    Endpoint para crear una nueva calificación de un viaje.
    
    Un usuario autenticado puede publicar una calificación (puntuación y comentario)
    para un viaje que ya ha sido completado.
    """
    permission_classes = [IsAuthenticatedCustom]
    serializer_class = AssessmentCreateSerializer 

    def create(self, request, *args, **kwargs):
        """
        Maneja la solicitud POST para crear la calificación.
        
        Añade validaciones personalizadas para asegurar que:
        1. El conductor especificado realmente pertenece al viaje.
        2. El viaje ya ha sido completado.
        3. El usuario no haya calificado ya este viaje.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        travel = serializer.validated_data['travel']
        driver = serializer.validated_data['driver']
        
        # Validación de negocio: El conductor debe coincidir con el del viaje.
        if travel.driver != driver:
            return Response({"error": "El viaje no fue realizado por el conductor especificado."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validación de negocio: Solo se califican viajes completados.
        if travel.travel_state != 'completed':
            return Response({"error": "Solo se pueden calificar viajes completados."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Asigna el usuario autenticado a la calificación y la guarda.
            assessment = serializer.save(user=request.user)
            
            # Devuelve la calificación recién creada usando el serializador de lectura.
            read_serializer = AssessmentReadSerializer(assessment)
            headers = self.get_success_headers(read_serializer.data)
            return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
        except IntegrityError:
            # Captura el error si se viola la restricción 'unique_user_travel_assessment'.
            return Response({"error": "Ya has calificado este viaje."}, status=status.HTTP_409_CONFLICT)

class AssessmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Endpoint para ver, actualizar o eliminar una calificación específica.
    
    Permite obtener los detalles de una calificación, modificarla (PATCH) o
    eliminarla (DELETE). Solo el usuario que creó la calificación puede
    modificarla o eliminarla.
    """
    permission_classes = [IsAuthenticatedCustom, IsOwner]
    queryset = Assessment.objects.all()
    lookup_field = 'pk' # Busca la calificación por su clave primaria (ID).
    
    # Limita los métodos HTTP permitidos a GET, PATCH y DELETE.
    http_method_names = ['get', 'patch', 'delete'] 

    def get_serializer_class(self):
        """
        Determina dinámicamente qué serializador usar según el método de la petición.
        
        - Para PATCH (actualizar), usa el serializador de actualización.
        - Para GET (ver), usa el serializador de lectura.
        """
        if self.request.method == 'PATCH':
            return AssessmentUpdateSerializer
        
        return AssessmentReadSerializer

class AssessmentListView(APIView):
    """
    Endpoint para listar todas las calificaciones del sistema.
    
    Devuelve una lista de todas las calificaciones realizadas, ordenadas
    de la más reciente a la más antigua. Generalmente para uso de administradores.
    """
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request, *args, **kwargs):
        """Maneja la solicitud GET para devolver todas las calificaciones."""
        assessments = Assessment.objects.all().order_by('-id')
        serializer = AssessmentReadSerializer(assessments, many=True)
        return Response(serializer.data)


class DriverAssessmentsListView(APIView):
    """
    Endpoint para listar todas las calificaciones de un conductor específico.
    
    Devuelve todas las valoraciones que ha recibido un conductor, identificado
    por el UID de su usuario asociado.
    """
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request, driver_id, *args, **kwargs):
        """
        Maneja la solicitud GET para devolver las calificaciones de un conductor.
        
        Parámetros de URL:
            driver_id (int): El UID del usuario (que es conductor) a buscar.
        """
        # Filtra las calificaciones buscando a través de la relación:
        # Assessment -> Driver -> User -> uid
        assessments = Assessment.objects.filter(driver__user__uid=driver_id).order_by('-id')
        serializer = AssessmentReadSerializer(assessments, many=True)
        return Response(serializer.data)