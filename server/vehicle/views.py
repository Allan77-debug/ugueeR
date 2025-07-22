from rest_framework import generics, status
from rest_framework.response import Response
from .models import Vehicle
from driver.models import Driver
from users.models import Users # Make sure this import is correct
from .serializers import VehicleSerializer
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import BasePermission
from users.permissions import IsAuthenticatedCustom
from rest_framework.views import APIView


class VehicleCreateView(generics.CreateAPIView):
    """ Vista para crear un vehículo asociado a un conductor aprobado."""

    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticatedCustom]

    def create(self, request, *args, **kwargs):
        try:
            user = request.user

    
            if user.driver_state != Users.DRIVER_STATE_APPROVED:
                return Response(
                    {"error": "Solo los conductores aprobados pueden crear vehículos."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            try:
                driver = Driver.objects.get(user=user)
            except Driver.DoesNotExist:
                return Response(
                    {"error": "No se encontró el conductor asociado a este usuario."},
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


class VehicleListByDriver(APIView):
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        user = request.user

        if user.driver_state != Users.DRIVER_STATE_APPROVED:
            return Response(
                {"error": "Solo los conductores aprobados pueden listar vehículos."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            driver = Driver.objects.get(user=user)
        except Driver.DoesNotExist:
            return Response(
                {"error": "No existe un conductor asociado a este usuario."},
                status=status.HTTP_404_NOT_FOUND,
            )

        vehicles = Vehicle.objects.filter(driver=driver)
        if not vehicles.exists():
            return Response(
                {"message": "No tienes vehículos registrados."},
                status=status.HTTP_200_OK,
            )

        serializer = VehicleSerializer(vehicles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class VehicleDeleteView(APIView):
    permission_classes = [IsAuthenticatedCustom]

    def delete(self, request, vehicle_id):
        user = request.user

        if user.driver_state != Users.DRIVER_STATE_APPROVED:
            return Response(
                {"error": "Solo los conductores aprobados pueden eliminar vehículos."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            driver = Driver.objects.get(user=user)
        except Driver.DoesNotExist:
            return Response(
                {"error": "No existe un conductor asociado a este usuario."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            vehicle = Vehicle.objects.get(id=vehicle_id, driver=driver)
        except Vehicle.DoesNotExist:
            return Response(
                {"error": "No se encontró un vehículo con ese ID asociado a tu cuenta."},
                status=status.HTTP_404_NOT_FOUND,
            )

        vehicle.delete()
        return Response({"message": "Vehículo eliminado exitosamente."}, status=status.HTTP_204_NO_CONTENT)




class VehicleDetailView(APIView):
    """
    Vista para obtener los detalles de un vehículo específico
    perteneciente al conductor autenticado.
    """
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request, vehicle_id):
        user = request.user

        if not hasattr(user, 'driver') or user.driver.validate_state != 'approved':
            return Response(
                {"error": "Acceso denegado. Solo los conductores aprobados pueden realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:

            vehicle = Vehicle.objects.get(id=vehicle_id)
        except Vehicle.DoesNotExist:
            return Response(
                {"error": "No se encontró un vehículo con el ID proporcionado."},
                status=status.HTTP_404_NOT_FOUND
            )


        if vehicle.driver != user.driver:
            return Response(
                {"error": "Este vehículo no te pertenece."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = VehicleSerializer(vehicle)
        return Response(serializer.data, status=status.HTTP_200_OK)