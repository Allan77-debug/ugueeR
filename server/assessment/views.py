

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
    Crea una nueva calificación. Ahora sí mostrará los parámetros en la API visual.
    POST: /api/assessment/create/
    """
    permission_classes = [IsAuthenticatedCustom]
    serializer_class = AssessmentCreateSerializer 

    def create(self, request, *args, **kwargs):
        """
        Sobrescribimos el método create para añadir nuestra lógica de validación personalizada.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        travel = serializer.validated_data['travel']
        driver = serializer.validated_data['driver']
        
        if travel.driver != driver:
            return Response({"error": "El viaje no fue realizado por el conductor especificado."}, status=status.HTTP_400_BAD_REQUEST)
        
        if travel.travel_state != 'completed':
            return Response({"error": "Solo se pueden calificar viajes completados."}, status=status.HTTP_400_BAD_REQUEST)
        

        try:
    
            assessment = serializer.save(user=request.user)

            read_serializer = AssessmentReadSerializer(assessment)
            headers = self.get_success_headers(read_serializer.data)
            return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
        except IntegrityError:
            return Response({"error": "Ya has calificado este viaje."}, status=status.HTTP_409_CONFLICT)

class AssessmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Maneja GET (leer), PATCH (actualizar) y DELETE (eliminar) para una calificación.
    YA NO INCLUYE EL MÉTODO PUT.
    """
    permission_classes = [IsAuthenticatedCustom, IsOwner]
    queryset = Assessment.objects.all()
    lookup_field = 'pk'
    
    http_method_names = ['get', 'patch', 'delete'] 

    def get_serializer_class(self):
        """
        Le dice a la interfaz visual QUÉ formulario dibujar.
        """
        if self.request.method == 'PATCH':
            return AssessmentUpdateSerializer
        
        return AssessmentReadSerializer

class AssessmentListView(APIView):
    permission_classes = [IsAuthenticatedCustom]
    def get(self, request, *args, **kwargs):
        assessments = Assessment.objects.all().order_by('-id')
        serializer = AssessmentReadSerializer(assessments, many=True)
        return Response(serializer.data)


class DriverAssessmentsListView(APIView):
    permission_classes = [IsAuthenticatedCustom]
    def get(self, request, driver_id, *args, **kwargs):
        assessments = Assessment.objects.filter(driver__user__uid=driver_id).order_by('-id')
        serializer = AssessmentReadSerializer(assessments, many=True)
        return Response(serializer.data)