# server/institutions/views.py

from django.shortcuts import render
from rest_framework import generics, status, views
from django.contrib.auth.hashers import check_password
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from .models import Institution
from users.models import Users
from driver.models import Driver
from .serializers import InstitutionSerializer, InstitutionDetailSerializer, DriverInfoSerializer, InstitutionLoginSerializer
from users.serializers import UsersSerializer
from rest_framework.response import Response
from .permissions import IsInstitutionAuthenticated
from .utils import generate_institution_token

class InstitutionCreateView(generics.CreateAPIView):
    """
    Vista para crear (registrar) una nueva institución.
    Accesible públicamente para que las instituciones puedan solicitar su registro.
    """ 
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    
    @swagger_auto_schema(operation_summary="Endpoint para registrar una nueva institución")
    def post(self, request, *args, **kwargs):
        """Maneja la lógica de creación de la institución."""
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
    """
    Vista para listar todas las instituciones.
    Diseñada para ser usada por un panel de administración general.
    """
    serializer_class = InstitutionDetailSerializer
    
    @swagger_auto_schema(operation_summary="Endpoint para listar todas las instituciones")
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        """
        Sobrescribe el método para permitir filtrar las instituciones por estado
        a través de un query parameter en la URL (ej: /list/?status=aprobada).
        """
        status_filter = self.request.query_params.get('status', None)
        queryset = Institution.objects.all()
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset.order_by('-application_date')

class InstitutionLoginView(generics.GenericAPIView):
    """Vista para el inicio de sesión de las instituciones."""
    serializer_class = InstitutionLoginSerializer
    
    @swagger_auto_schema(operation_summary="Endpoint para iniciar sesión como institución")
    def post(self, request):
        """Maneja la petición POST para el login."""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['ipassword']
            try:
                institution = Institution.objects.get(email=email)
                if check_password(password, institution.ipassword):
                    token = generate_institution_token(institution)
                    return Response({
                        "message": "Login Exitoso",
                        "token": token,
                        "institution_details": {
                            "id_institution": institution.id_institution,
                            "official_name": institution.official_name,
                            "email": institution.email,
                        }
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
            except Institution.DoesNotExist:
                return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InstitutionApproveUser(views.APIView):
    """
    Vista para que una institución autenticada apruebe a un usuario.
    La institución se identifica a través de su token JWT.
    """
    permission_classes = [IsInstitutionAuthenticated]

    @swagger_auto_schema(operation_summary="Endpoint para aprobar la solicitud de un usuario")
    def post(self, request, uid, *args, **kwargs):
        """Maneja la aprobación del usuario."""
        institution = request.institution
        user_to_approve = get_object_or_404(Users, uid=uid)
        
        if user_to_approve.user_state == Users.STATE_APPROVED:
            if user_to_approve.institution == institution:
                return Response({"message": f"El usuario {user_to_approve.full_name} ya está aprobado en tu institución."}, status=status.HTTP_400_BAD_REQUEST)
            else:
                 return Response({"message": f"El usuario {user_to_approve.full_name} ya pertenece a otra institución."}, status=status.HTTP_400_BAD_REQUEST)
        
        if user_to_approve.institution and user_to_approve.institution != institution:
             return Response({"message": f"El usuario {user_to_approve.full_name} está pendiente para otra institución."}, status=status.HTTP_403_FORBIDDEN)

        user_to_approve.institution = institution
        user_to_approve.user_state = Users.STATE_APPROVED
        user_to_approve.save()
        return Response({"message": f"El usuario {user_to_approve.full_name} ha sido aprobado."}, status=status.HTTP_200_OK)

class InstitutionRejectUser(views.APIView):
    """
    Vista para que una institución autenticada rechace a un usuario.
    """
    permission_classes = [IsInstitutionAuthenticated]

    @swagger_auto_schema(operation_summary="Endpoint para rechazar la solicitud de un usuario")
    def post(self, request, uid, *args, **kwargs):
        """Maneja el rechazo del usuario."""
        institution = request.institution
        user_to_reject = get_object_or_404(Users, uid=uid)
        
        user_to_reject.institution = institution
        user_to_reject.user_state = Users.STATE_REJECTED
        user_to_reject.save()
        return Response({"message": f"El usuario {user_to_reject.full_name} ha sido rechazado."}, status=status.HTTP_200_OK)

class InstitutionUsersView(views.APIView):
    """
    Vista para listar todos los miembros (usuarios) de la institución autenticada.
    """
    permission_classes = [IsInstitutionAuthenticated]
    
    @swagger_auto_schema(operation_summary="Endpoint para listar los usuarios de mi institución")
    def get(self, request):
        """Devuelve la lista de usuarios de la institución."""
        institution = request.institution
        users = Users.objects.filter(institution_id=institution)
        serializer = UsersSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class DriverApplicationsListView(generics.ListAPIView):
    """
    Lista las solicitudes pendientes de usuarios que quieren ser conductores
    para la institución autenticada.
    """
    permission_classes = [IsInstitutionAuthenticated]
    serializer_class = DriverInfoSerializer

    @swagger_auto_schema(operation_summary="Endpoint para listar solicitudes de conductor pendientes")
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        """Filtra los usuarios para mostrar solo los de la institución con estado de conductor 'pendiente'."""
        institution = self.request.institution
        return Users.objects.filter(institution=institution, driver_state='pendiente')

class ApproveDriverView(views.APIView):
    """
    Vista para que la institución autenticada apruebe una solicitud de conductor.
    """
    permission_classes = [IsInstitutionAuthenticated]

    @swagger_auto_schema(operation_summary="Endpoint para aprobar una solicitud de conductor")
    def post(self, request, uid):
        """Maneja la aprobación de la solicitud de conductor."""
        institution = request.institution
        user = get_object_or_404(Users, uid=uid)

        if user.institution != institution:
            return Response({"error": "Este usuario no pertenece a tu institución."}, status=status.HTTP_400_BAD_REQUEST)
        if user.driver_state != "pendiente":
            return Response({"error": "Este usuario no tiene una solicitud de conductor pendiente."}, status=status.HTTP_400_BAD_REQUEST)

        user.driver_state = "aprobado"
        user.save()
        Driver.objects.update_or_create(user=user, defaults={'validate_state': 'approved'})
        return Response({"message": f"La solicitud de conductor de {user.full_name} ha sido aprobada."}, status=status.HTTP_200_OK)

class RejectDriverView(views.APIView):
    """
    Vista para que la institución autenticada rechace una solicitud de conductor.
    """
    permission_classes = [IsInstitutionAuthenticated]

    @swagger_auto_schema(operation_summary="Endpoint para rechazar una solicitud de conductor")
    def post(self, request, uid):
        """Maneja el rechazo de la solicitud de conductor."""
        institution = request.institution
        user = get_object_or_404(Users, uid=uid)

        if user.institution != institution:
            return Response({"error": "Este usuario no pertenece a tu institución."}, status=status.HTTP_400_BAD_REQUEST)
        
        user.driver_state = "rechazado"
        user.save()
        return Response({"message": f"La solicitud de conductor de {user.full_name} ha sido rechazada."}, status=status.HTTP_200_OK)