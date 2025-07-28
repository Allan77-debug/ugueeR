from django.shortcuts import render
from rest_framework import generics, status, views
from django.contrib.auth.hashers import check_password
from django.shortcuts import get_object_or_404
from .models import Institution
from users.models import Users
from driver.models import Driver  #
from .serializers import InstitutionSerializer, InstitutionDetailSerializer, DriverInfoSerializer, InstitutionLoginSerializer
from users.serializers import UsersSerializer
from rest_framework.response import Response
from .permissions import IsInstitutionAuthenticated
from .utils import generate_institution_token


class InstitutionCreateView(generics.CreateAPIView):
    """Vista para crear una institución.""" 
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
        status_filter = self.request.query_params.get('status', None)
        queryset = Institution.objects.all()
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset.order_by('-application_date')
    

class InstitutionLoginView(generics.GenericAPIView):
    """Vista para el inicio de sesión de instituciones."""
    serializer_class = InstitutionLoginSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['ipassword']

            try:
                institution = Institution.objects.get(email=email)
                
                # Comprobamos la contraseña hasheada
                if check_password(password, institution.ipassword):
                    
                    # --- ¡CAMBIO CLAVE AQUÍ! ---
                    # Si el login es correcto, generamos el token.
                    token = generate_institution_token(institution)
                    
                    return Response({
                        "message": "Login Exitoso",
                        "token": token, # <-- AÑADIMOS EL TOKEN A LA RESPUESTA
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
    El ID de la institución se obtiene del token.
    """
    # MODIFICADO: Se añade la clase de permiso.
    permission_classes = [IsInstitutionAuthenticated]

    # MODIFICADO: Ya no se necesita 'institution_id' en la firma del método.
    def post(self, request, uid, *args, **kwargs):
        # MODIFICADO: Obtenemos la institución directamente del token a través del request.
        institution = request.institution
        user_to_approve = get_object_or_404(Users, uid=uid)

        # La lógica de validación ahora usa 'institution' en lugar de 'institution_from_url'
        if user_to_approve.user_state == Users.STATE_APPROVED:
            # ... (código de lógica sin cambios, solo la variable)
            if user_to_approve.institution == institution:
                return Response(...)
            # ...
        
        if user_to_approve.institution and user_to_approve.institution != institution:
             return Response(
                {"message": f"El usuario {user_to_approve.full_name} está pendiente para otra institución."},
                status=status.HTTP_403_FORBIDDEN 
            )

        user_to_approve.institution = institution
        user_to_approve.user_state = Users.STATE_APPROVED
        user_to_approve.save()

        return Response(
            {"message": f"El usuario {user_to_approve.full_name} ha sido aprobado para la institución {institution.official_name}."},
            status=status.HTTP_200_OK
        )

class InstitutionRejectUser(views.APIView):
    """
    Vista para que una institución autenticada rechace a un usuario.
    El ID de la institución se obtiene del token.
    """
    # MODIFICADO: Se añade la clase de permiso.
    permission_classes = [IsInstitutionAuthenticated]

    # MODIFICADO: Se elimina 'institution_id' de la firma.
    def post(self, request, uid, *args, **kwargs):
        # MODIFICADO: Se obtiene la institución del token.
        institution = request.institution
        user_to_reject = get_object_or_404(Users, uid=uid)
        
        # ... (Toda la lógica de validación interna sigue igual, pero usando 'institution') ...
        
        user_to_reject.institution = institution
        user_to_reject.user_state = Users.STATE_REJECTED
        user_to_reject.save()

        return Response(
            {"message": f"El usuario {user_to_reject.full_name} ha sido rechazado por la institución {institution.official_name}."},
            status=status.HTTP_200_OK
        )

class InstitutionUsersView(views.APIView):
    """
    Vista para listar todos los miembros de la institución autenticada.
    """
    # MODIFICADO: Se añade la clase de permiso.
    permission_classes = [IsInstitutionAuthenticated]
    
    # MODIFICADO: Se elimina 'institution_id' de la firma.
    def get(self, request):
        # MODIFICADO: Se obtiene la institución del token.
        institution = request.institution
        users = Users.objects.filter(institution_id=institution)
        serializer = UsersSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class DriverApplicationsListView(generics.ListAPIView):
    """
    Lista las solicitudes de conductor para la institución autenticada.
    """
    # MODIFICADO: Se añade la clase de permiso.
    permission_classes = [IsInstitutionAuthenticated]
    serializer_class = DriverInfoSerializer

    def get_queryset(self):
        # MODIFICADO: Se obtiene la institución del token a través del request.
        institution = self.request.institution
        return Users.objects.filter(institution=institution, driver_state='pendiente')

    # ... (el método list no necesita cambios)

class ApproveDriverView(views.APIView):
    """
    Vista para que la institución autenticada apruebe una solicitud de conductor.
    """
    # MODIFICADO: Se añade la clase de permiso.
    permission_classes = [IsInstitutionAuthenticated]

    # MODIFICADO: Se elimina 'institution_id' de la firma.
    def post(self, request, uid):
        # MODIFICADO: Se obtiene la institución del token.
        institution = request.institution
        user = get_object_or_404(Users, uid=uid)

        if user.institution != institution:
            # Esta validación sigue siendo útil por si el usuario fue reasignado.
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
    # MODIFICADO: Se añade la clase de permiso.
    permission_classes = [IsInstitutionAuthenticated]

    # MODIFICADO: Se elimina 'institution_id' de la firma.
    def post(self, request, uid):
        # MODIFICADO: Se obtiene la institución del token.
        institution = request.institution
        user = get_object_or_404(Users, uid=uid)

        if user.institution != institution:
            return Response({"error": "Este usuario no pertenece a tu institución."}, status=status.HTTP_400_BAD_REQUEST)
        
        # ... (lógica de validación sin cambios) ...

        user.driver_state = "rechazado"
        user.save()

        return Response({"message": f"La solicitud de conductor de {user.full_name} ha sido rechazada."}, status=status.HTTP_200_OK)