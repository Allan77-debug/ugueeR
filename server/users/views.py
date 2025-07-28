# server/users/views.py
from rest_framework import generics, status
from rest_framework.response import Response
from .models import Users
from .serializers import UsersSerializer, UsersLoginSerializer, DriverApplicationSerializer, UsersProfileSerializer
from django.contrib.auth.hashers import check_password
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
import jwt
from .permissions import IsAuthenticatedCustom
from django.conf import settings
import datetime
from drf_yasg.utils import swagger_auto_schema

class UsersCreateView(generics.CreateAPIView):
    """
    Vista para registrar un nuevo usuario en el sistema.
    Valida el correo institucional para asociar al usuario con una institución.
    """
    serializer_class = UsersSerializer
    permission_classes = [AllowAny] # Cualquiera puede intentar registrarse.

    @swagger_auto_schema(
        operation_summary="Endpoint para registrar un nuevo usuario",
        operation_description="""
        Crea un nuevo usuario en el sistema.
        - La contraseña se hashea automáticamente.
        - El correo institucional se valida para encontrar y asignar una institución existente.
        - El estado inicial del usuario es 'pendiente'.
        """
    )
    def create(self, request, *args, **kwargs):
        try:
            # Pasa la petición al serializador para la validación.
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True) # Lanza error si no es válido.
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(
                {"message": "Usuario registrado exitosamente. Su cuenta está pendiente de aprobación."},
                status=status.HTTP_201_CREATED, 
                headers=headers
            )
        except Exception as e:
            return Response(
                {"error": "Hubo un error al procesar su solicitud.", "detail": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class UsersLoginView(generics.GenericAPIView):
    """
    Vista para el inicio de sesión de usuarios.
    Devuelve un token JWT personalizado si las credenciales son correctas.
    """
    serializer_class = UsersLoginSerializer
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="Endpoint para inicio de sesión de usuarios",
        operation_description="""
        Autentica a un usuario con su correo institucional y contraseña.
        Si las credenciales son válidas, devuelve un token JWT con una
        duración de 8 horas.
        """
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['institutional_mail']
        password = serializer.validated_data['upassword']

        try:
            user = Users.objects.get(institutional_mail=email)

            # Verifica la contraseña hasheada.
            if user and check_password(password, user.upassword):
                
                # --- Creación manual del token JWT ---
                # 1. Definir el contenido (payload) del token.
                payload = {
                    'user_id': user.uid,
                    # 2. Establecer la fecha de expiración (exp) para 8 horas.
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=8), 
                    # 3. Incluir la fecha de emisión (issued at).
                    'iat': datetime.datetime.utcnow(),
                }

                # 4. Codificar el token con la clave secreta del proyecto.
                token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

                return Response({
                    'token': token,
                    'uid': user.uid,
                    'message': "Inicio de sesión exitoso"
                }, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
        except Users.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

class ApplyToBeDriverView(APIView):
    """
    Vista para que un usuario aprobado solicite ser conductor.
    Cambia el `driver_state` del usuario a 'pendiente'.
    """
    permission_classes = [IsAuthenticatedCustom] # Requiere un token válido.

    @swagger_auto_schema(
        operation_summary="Endpoint para solicitar ser conductor",
        operation_description="""
        Permite a un usuario autenticado y con estado 'aprobado'
        enviar una solicitud para convertirse en conductor.
        Actualiza el `driver_state` del usuario a 'pendiente'.
        """
    )
    def patch(self, request):
        try:
            user = request.user # El usuario se obtiene del token gracias a IsAuthenticatedCustom.

            # Solo los usuarios cuyo estado general ya es 'aprobado' pueden aplicar.
            if user.user_state != Users.STATE_APPROVED:
                return Response({
                    "error": "Solo los usuarios aprobados pueden aplicar para ser conductor."
                }, status=status.HTTP_403_FORBIDDEN)

            user.driver_state = Users.DRIVER_STATE_PENDING
            user.save(update_fields=['driver_state'])

            return Response({
                "message": "Solicitud para ser conductor enviada correctamente."
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UsersProfileView(generics.RetrieveAPIView):
    """
    Vista para obtener el perfil público de un usuario por su UID.
    """
    queryset = Users.objects.all()
    serializer_class = UsersProfileSerializer
    permission_classes = [IsAuthenticatedCustom] # Requiere autenticación para ver perfiles.
    lookup_field = 'uid' # Usa el campo 'uid' para buscar al usuario en la URL.

    @swagger_auto_schema(
        operation_summary="Endpoint para obtener el perfil de un usuario",
        operation_description="Obtiene la información pública de un usuario específico a través de su UID."
    )
    def retrieve(self, request, *args, **kwargs):
        # El método retrieve de RetrieveAPIView ya hace el get_object y la serialización.
        # Simplemente llamamos al método padre para mantener el comportamiento estándar.
        return super().retrieve(request, *args, **kwargs)