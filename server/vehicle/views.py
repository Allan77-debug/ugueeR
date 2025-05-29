from rest_framework import generics, status
from rest_framework.response import Response
from .models import Vehicle
from driver.models import Driver  # Import the Driver model
from users.models import Users
from .serializers import VehicleSerializer
from rest_framework.exceptions import ValidationError
import jwt
from django.conf import settings
from rest_framework.permissions import BasePermission
from rest_framework_simplejwt.authentication import JWTAuthentication


class IsAuthenticatedCustom(BasePermission):
    """ Allows access only to authenticated users. """
    def has_permission(self, request, view):
        try:
            authorization_header = request.META.get('HTTP_AUTHORIZATION')
            if not authorization_header:
                return False

            token = authorization_header.split(' ')[1]
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
            if not user_id:
                return False
            
            request.user = Users.objects.get(uid=user_id)
            return True
        except:
            return False


class VehicleCreateView(generics.CreateAPIView):
    """ Vista para crear un vehículo asociado a un conductor aprobado."""

    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticatedCustom]

    def create(self, request, *args, **kwargs):
        try:
            user = request.user

            try:
                driver = Driver.objects.get(user=user) 
            except Driver.DoesNotExist:
                return Response(
                    {"error": "No se encontró el conductor con el ID proporcionado."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if driver.validate_state != "approved":
                return Response(
                    {"error": "El conductor no está aprobado."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                serializer.save(driver=driver)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )