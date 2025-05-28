from django.shortcuts import render

# Create your views here.
from rest_framework import generics, status, views
from django.contrib.auth.hashers import check_password
from django.shortcuts import get_object_or_404
from .models import Institution
from users.models import Users
from .serializers import InstitutionSerializer, InstitutionDetailSerializer, DriverInfoSerializer, InstitutionLoginSerializer
from users.serializers import UsersSerializer
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

class InstitutionApproveUser(views.APIView):
    """Vista para aceptar un usuario en una institución"""

    def post(self, request, institution_id, uid, *args, **kwargs):
        institution_from_url = get_object_or_404(Institution, id_institution=institution_id)
        user_to_approve = get_object_or_404(Users, uid=uid)

        if user_to_approve.user_state == Users.STATE_APPROVED:
            if user_to_approve.institution == institution_from_url:
                return Response(
                    {"message": f"El usuario {user_to_approve.full_name} ya está aprobado para esta institución."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            else:
                user_current_institution_name = user_to_approve.institution.official_name if user_to_approve.institution else "ninguna institución"
                return Response(
                    {"message": f"El usuario {user_to_approve.full_name} ya está aprobado (posiblemente para {user_current_institution_name}). No se puede volver a procesar la aprobación aquí."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if user_to_approve.user_state != Users.STATE_PENDING:
            return Response(
                {"message": f"Solo se pueden aprobar usuarios en estado 'pendiente'. El estado actual de {user_to_approve.full_name} es '{user_to_approve.get_user_state_display()}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if user_to_approve.institution is None:
            pass 
        elif user_to_approve.institution != institution_from_url:
            return Response(
                {"message": f"El usuario {user_to_approve.full_name} está registrado como pendiente para la institución '{user_to_approve.institution.official_name}', "
                            f"pero se está intentando aprobar desde '{institution_from_url.official_name}'. Esta acción no está permitida."},
                status=status.HTTP_403_FORBIDDEN # Or HTTP_400_BAD_REQUEST
            )


        user_to_approve.institution = institution_from_url
        user_to_approve.user_state = Users.STATE_APPROVED
        user_to_approve.save()

        return Response(
            {"message": f"El usuario {user_to_approve.full_name} ha sido aprobado para la institución {institution_from_url.official_name}."},
            status=status.HTTP_200_OK
        )
class InstitutionRejectUser(views.APIView):

    """Vista para rechazar un usuario de una institución"""

    def post(self, request, institution_id, uid, *args, **kwargs):
        institution_from_url = get_object_or_404(Institution, id_institution=institution_id)
        user_to_reject = get_object_or_404(Users, uid=uid)


        rejection_reason = request.data.get('reason', 'No se especificó un motivo.') 

        if user_to_reject.user_state == Users.STATE_APPROVED:
            user_current_institution_name = user_to_reject.institution.official_name if user_to_reject.institution else "una institución"
            return Response(
                {"message": f"El usuario {user_to_reject.full_name} ya está aprobado por {user_current_institution_name}. "
                            "Para rechazarlo, primero debe ser removido o su estado de aprobación revertido."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if user_to_reject.user_state == Users.STATE_REJECTED and user_to_reject.institution == institution_from_url:
            return Response(
                {"message": f"El usuario {user_to_reject.full_name} ya ha sido rechazado por esta institución."},
                status=status.HTTP_400_BAD_REQUEST 
            )

        if user_to_reject.user_state != Users.STATE_PENDING:
            return Response(
                {"message": f"Solo se pueden rechazar usuarios en estado 'pendiente'. El estado actual de {user_to_reject.full_name} es '{user_to_reject.get_user_state_display()}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if user_to_reject.institution is None:
        
            pass 
        elif user_to_reject.institution != institution_from_url:
            return Response(
                {"message": f"El usuario {user_to_reject.full_name} está registrado como pendiente para la institución '{user_to_reject.institution.official_name}', "
                            f"pero se está intentando rechazar desde '{institution_from_url.official_name}'. Esta acción no está permitida."},
                status=status.HTTP_403_FORBIDDEN # Or HTTP_400_BAD_REQUEST
            )

        user_to_reject.institution = institution_from_url # Confirm or set the institution
        user_to_reject.user_state = Users.STATE_REJECTED
        user_to_reject.save()

        return Response(
            {"message": f"El usuario {user_to_reject.full_name} ha sido rechazado por la institución {institution_from_url.official_name}."},
            status=status.HTTP_200_OK
        )

class InstitutionUsersView(views.APIView):
    """Vista para listar todas los miembros de una Institucion para el panel de Instituciones"""
    def get(self, request, institution_id):
        institution = get_object_or_404(Institution, pk=institution_id)
        users = Users.objects.filter(institution_id=institution)
        serializer = UsersSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class InstitutionLoginView(generics.GenericAPIView):
    serializer_class = InstitutionLoginSerializer
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['ipassword']

            try:
                institution = Institution.objects.get(email=email)
                if check_password(password, institution.ipassword):
                    return Response({"message": "Login Exitoso"}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Contraseña incorrecta"}, status=status.HTTP_401_UNAUTHORIZED)
            except Institution.DoesNotExist:
                return Response({"error": "Institucion no encontrada"}, status=status.HTTP_404_NOT_FOUND)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DriverApplicationsListView(generics.ListAPIView):
    """Lista todas las solicitudes de usuarios que quieren convertirse en conductores para una institución específica."""
    serializer_class = DriverInfoSerializer

    def get_queryset(self):
        institution_id = self.kwargs['institution_id']
        institution = get_object_or_404(Institution, pk=institution_id)
        queryset = Users.objects.filter(institution=institution, driver_state='PENDIENTE')
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        if not queryset.exists():
            return Response({"message": "No hay solicitudes de conductor pendientes."}, status=status.HTTP_200_OK)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)