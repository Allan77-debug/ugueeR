from django.shortcuts import render

# Create your views here.
from rest_framework import generics, status, views
from django.shortcuts import get_object_or_404
from .models import Institution
from .serializers import InstitutionSerializer, InstitutionDetailSerializer
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

class InstitutionListView(generics.ListAPIView):
    """Vista para listar todas las instituciones para el panel de administración"""
    serializer_class = InstitutionDetailSerializer
    
    def get_queryset(self):
        # Filtrar por estado si se proporciona en la consulta
        status_filter = self.request.query_params.get('status', None)
        queryset = Institution.objects.all()
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset.order_by('-application_date')

class InstitutionApproveView(views.APIView):
    """Vista para aprobar una institución"""
    
    def post(self, request, institution_id, *args, **kwargs):
        role = request.data.get('role', 'Universidad')
        institution = get_object_or_404(Institution, id_institution=institution_id)
        
        # Actualizar estado a aprobado
        institution.status = 'aprobada'
        institution.validate_state = True
        institution.role = role  # Guardar el rol asignado
        institution.save()
        
        return Response(
            {"message": f"La institución {institution.official_name} ha sido aprobada correctamente."},
            status=status.HTTP_200_OK
        )

class InstitutionRejectView(views.APIView):
    """Vista para rechazar una institución"""
    
    def post(self, request, institution_id, *args, **kwargs):
        reason = request.data.get('reason', '')
        if not reason:
            return Response(
                {"error": "Debe proporcionar un motivo para el rechazo."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        institution = get_object_or_404(Institution, id_institution=institution_id)
        
        # Actualizar estado a rechazado
        institution.status = 'rechazada'
        institution.rejection_reason = reason
        institution.save()
        
        return Response(
            {"message": f"La institución {institution.official_name} ha sido rechazada."},
            status=status.HTTP_200_OK
        )
