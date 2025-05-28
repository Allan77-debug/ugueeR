from rest_framework.views import APIView
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from django.contrib.auth.hashers import check_password
from django.shortcuts import get_object_or_404
from .models import AdminUser
from institutions.models import Institution


class AdminLoginView(APIView):
    def post(self, request, *args, **kwargs):

        # Obtener email y contraseña del cuerpo de la solicitud
        email = request.data.get("email")
        password = request.data.get("password")

        # Validar que se hayan proporcionado ambos campos
        if not email or not password:
            return Response(
                {"error": "Email y contraseña son requeridos."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Valida que el email coincida con uno de la tabla admin_user
        # y que la contraseña coincida con la almacenada en la base de datos
        admin = AdminUser.objects.filter(aemail=email).first()

        if admin is None:
            return Response(
                {"error": "Credenciales inválidas."},
                status=status.HTTP_401_UNAUTHORIZED,
            )


        if not check_password(password, admin.apassword):
            return Response(
                {"error": "Credenciales inválidas."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        
        # Si las credenciales son correctas, devolver respuesta exitosa con token
        # Aquí tenemos que generar un token JWT o algún otro tipo de token de sesión
        return Response(
            {
                "message": "Inicio de sesión exitoso.",
                "admin_id": admin.aid,
                "token": "admin-token-placeholder",
            },
            status=status.HTTP_200_OK,
        )

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
