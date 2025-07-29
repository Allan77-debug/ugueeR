from rest_framework import generics, status
from rest_framework.response import Response
from .models import Users
from .serializers import UsersSerializer, UsersLoginSerializer, DriverApplicationSerializer, UsersProfileSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework.authentication import TokenAuthentication
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from institutions.models import Institution  
from institutions.serializers import DriverInfoSerializer 
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
import jwt
from .permissions import IsAuthenticatedCustom
from django.conf import settings
import datetime

class UsersCreateView(generics.CreateAPIView):
    """ Vista para registrar un nuevo usuario. """
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
    """ Vista para el inicio de sesión de usuarios. """
    serializer_class = UsersLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['institutional_mail']
            password = serializer.validated_data['upassword']

            try:
                user = Users.objects.get(institutional_mail=email)

                if user and check_password(password, user.upassword):
                    # --- ¡AQUÍ ESTÁ EL CAMBIO CLAVE! ---
                    # En lugar de usar RefreshToken, creamos el token manualmente.
                    
                    # 1. Definimos el payload (el contenido del token)
                    payload = {
                        'user_id': user.uid,
                        
                        # 2. ¡ESTA ES LA LÍNEA QUE CONTROLA LA DURACIÓN!
                        # Le decimos que el token expira en 8 horas a partir de ahora.
                        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=8), 
                        
                        # Es una buena práctica incluir la fecha de creación (issued at)
                        'iat': datetime.datetime.utcnow(),
                    }

                    # 3. Codificamos el token con nuestra SECRET_KEY
                    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

                    # 4. Devolvemos nuestro token personalizado
                    return Response({
                        'token': token, # Ya no devolvemos 'access' y 'refresh', solo nuestro token.
                        'uid': user.uid,
                        'message': "Login Exitoso"
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
            except Users.DoesNotExist:
                return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UsersDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Users.objects.all()
    serializer_class = UsersSerializer
    lookup_field = 'pk'  
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

class ApplyToBeDriverView(APIView):
    """Vista para que un usuario solicite ser conductor."""
    permission_classes = [IsAuthenticatedCustom]

    def patch(self, request):
        try:
            user = request.user  # ⚠️ YA viene del token

            if user.user_state != Users.STATE_APPROVED:
                return Response({
                    "error": "Solo los usuarios aprobados pueden aplicar para ser conductor."
                }, status=status.HTTP_403_FORBIDDEN)

            user.driver_state = Users.DRIVER_STATE_PENDING
            user.save()

            return Response({
                "message": "Aplicación para ser conductor enviada correctamente."
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UsersProfileView(generics.RetrieveAPIView):
    queryset = Users.objects.all()
    serializer_class = UsersProfileSerializer
    lookup_field = 'uid' 
    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        data = {
            'uid': user.uid,
            'full_name': user.full_name,
            'user_type': user.user_type,
            'institutional_mail': user.institutional_mail,
            'student_code': user.student_code,
            'institution_name': user.institution.official_name if user.institution else None,
            'driver_state': user.driver_state,
        }
        return Response(data, status=status.HTTP_200_OK)