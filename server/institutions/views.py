from django.shortcuts import render

# Create your views here.
from rest_framework import generics, status
from .models import Institution
from .serializers import InstitutionSerializer
from rest_framework.response import Response


class InstitutionCreateView(generics.CreateAPIView):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(
                    {"message": "Institución registrada exitosamente. Pendiente de aprobación."},
                    status=status.HTTP_201_CREATED, 
                    headers=headers
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": str(e), "detail": "Hubo un error al procesar su solicitud."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
