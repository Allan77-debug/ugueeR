from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from django.contrib.auth.hashers import check_password
from .models import AdminUser


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
