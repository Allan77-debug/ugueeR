from django.shortcuts import render
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
from rest_framework import generics, status, views
from .serializers import UsersSerializer, UsersLoginSerializer
from .models import Users
from rest_framework.response import Response

class UsersCreateView(generics.CreateAPIView):
    serializer_class = UsersSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(
                    {"message": "Usuario registrado exitosamente."},
                    status=status.HTTP_201_CREATED, 
                    headers=headers
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": str(e), "detail": "Hubo un error al procesar su solicitud."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class UsersLoginView(generics.GenericAPIView):
    serializer_class = UsersLoginSerializer
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['institutional_mail']
            password = serializer.validated_data['upassword']

            try:
                user = Users.objects.get(institutional_mail=email)
                if check_password(password, user.upassword):
                    return Response({"message": "Login Exitoso"}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Contraseña incorrecta"}, status=status.HTTP_401_UNAUTHORIZED)
            except Users.DoesNotExist:
                return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)