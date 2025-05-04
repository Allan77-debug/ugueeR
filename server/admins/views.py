from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from django.contrib.auth.hashers import check_password

class AdminLoginView(APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email y contraseña son requeridos."}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute("SELECT aid, aemail, apassword FROM admin_user WHERE aemail = %s", [email])
            admin = cursor.fetchone()

        if admin is None:
            return Response({"error": "Credenciales inválidas."}, status=status.HTTP_401_UNAUTHORIZED)

        aid, aemail, apassword = admin
        if not check_password(password, apassword):
            return Response({"error": "Credenciales inválidas."}, status=status.HTTP_401_UNAUTHORIZED)

        return Response({
            "message": "Inicio de sesión exitoso.",
            "admin_id": aid,
            "token": "admin-token-placeholder"
        }, status=status.HTTP_200_OK)
