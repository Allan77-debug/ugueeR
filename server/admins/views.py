"""
Define las vistas y la lógica de la API para la aplicación 'admins'.

Estas vistas manejan las acciones que un administrador puede realizar, como
la autenticación y la gestión (aprobación/rechazo) de solicitudes de instituciones.
"""
from rest_framework.views import APIView
from rest_framework import generics, status, views
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password
from django.shortcuts import get_object_or_404
from .models import AdminUser
from institutions.models import Institution


class AdminLoginView(APIView):
    """
    Endpoint para la autenticación de usuarios administradores.
    
    Permite a un administrador iniciar sesión proporcionando su correo y contraseña
    para obtener un token de acceso y gestionar el sistema.
    """
    def post(self, request, *args, **kwargs):
        """
        Maneja la solicitud POST para el inicio de sesión del administrador.
        
        Cuerpo de la Petición:
            email (str): El correo electrónico del administrador.
            password (str): La contraseña del administrador.
        
        Devuelve:
            - Un mensaje de éxito con el ID y un token si las credenciales son correctas.
            - Un error 400 si faltan credenciales.
            - Un error 401 si las credenciales son inválidas.
        """
        # Obtener email y contraseña del cuerpo de la solicitud
        email = request.data.get("email")
        password = request.data.get("password")

        # Validar que se hayan proporcionado ambos campos
        if not email or not password:
            return Response(
                {"error": "Email y contraseña son requeridos."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Valida que el email exista en la tabla admin_user
        admin = AdminUser.objects.filter(aemail=email).first()

        if admin is None:
            return Response(
                {"error": "Credenciales inválidas."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Valida que la contraseña coincida con la almacenada en la base de datos
        if not check_password(password, admin.apassword):
            return Response(
                {"error": "Credenciales inválidas."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        
        # Si las credenciales son correctas, devolver respuesta exitosa con token
        # Aquí se debe generar un token JWT o similar para la sesión.
        return Response(
            {
                "message": "Inicio de sesión exitoso.",
                "admin_id": admin.aid,
                "token": "admin-token-placeholder", # TODO: Implementar generación de token JWT
            },
            status=status.HTTP_200_OK,
        )

class InstitutionApproveView(views.APIView):
    """
    Endpoint para aprobar el registro de una institución.
    
    Un administrador puede usar este endpoint para cambiar el estado de una
    institución de 'pendiente' o 'rechazada' a 'aprobada'.
    """
    def post(self, request, institution_id, *args, **kwargs):
        """
        Maneja la solicitud POST para aprobar una institución.
        
        Parámetros de URL:
            institution_id (int): El ID de la institución a aprobar.
        
        Cuerpo de la Petición (Opcional):
            role (str): Un campo opcional, actualmente no utilizado en la lógica.
        
        Devuelve:
            - Un mensaje de éxito si la institución es aprobada.
            - Un error 404 si la institución no se encuentra.
        """
        role = request.data.get('role', 'Universidad')
        institution = get_object_or_404(Institution, id_institution=institution_id)
        
        # Actualizar estado a aprobado
        institution.status = 'aprobada'
        institution.validate_state = True
        institution.role = role  # Guardar el rol asignado
        institution.save()
        
        return Response(
            {"message": f"La institución '{institution.official_name}' ha sido aprobada correctamente."},
            status=status.HTTP_200_OK
        )

class InstitutionRejectView(views.APIView):
    """
    Endpoint para rechazar el registro de una institución.
    
    Un administrador puede usar este endpoint para cambiar el estado de una
    institución a 'rechazada', proporcionando un motivo obligatorio.
    """
    def post(self, request, institution_id, *args, **kwargs):
        """
        Maneja la solicitud POST para rechazar una institución.
        
        Parámetros de URL:
            institution_id (int): El ID de la institución a rechazar.
        
        Cuerpo de la Petición (Obligatorio):
            reason (str): El motivo por el cual la solicitud es rechazada.
        
        Devuelve:
            - Un mensaje de éxito si la institución es rechazada.
            - Un error 400 si no se proporciona un motivo.
            - Un error 404 si la institución no se encuentra.
        """
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
            {"message": f"La institución '{institution.official_name}' ha sido rechazada."},
            status=status.HTTP_200_OK
        )