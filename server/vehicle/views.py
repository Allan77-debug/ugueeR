# server/vehicle/views.py
from rest_framework import generics, status
from rest_framework.response import Response
from .models import Vehicle
from driver.models import Driver
from users.models import Users
from .serializers import VehicleSerializer
from rest_framework.exceptions import PermissionDenied
from users.permissions import IsAuthenticatedCustom
from rest_framework.views import APIView
from drf_yasg.utils import swagger_auto_schema

class VehicleCreateView(generics.CreateAPIView):
    """
    Vista para que un conductor aprobado registre un nuevo vehículo.
    """
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticatedCustom] # Requiere autenticación.

    @swagger_auto_schema(
        operation_summary="Endpoint para registrar un nuevo vehículo",
        operation_description="""
        Permite a un conductor autenticado y con estado 'aprobado' registrar un nuevo vehículo.
        El vehículo quedará automáticamente asociado al conductor que realiza la petición.
        """
    )
    def create(self, request, *args, **kwargs):
        try:
            user = request.user # Usuario obtenido del token por IsAuthenticatedCustom.

            # 1. Verificar que el usuario tiene el estado de conductor aprobado.
            if user.driver_state != Users.DRIVER_STATE_APPROVED:
                raise PermissionDenied("Solo los conductores aprobados pueden crear vehículos.")

            # 2. Obtener el perfil de Driver asociado al usuario.
            try:
                driver = Driver.objects.get(user=user)
            except Driver.DoesNotExist:
                return Response(
                    {"error": "No se encontró el perfil de conductor asociado a este usuario."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            
            # Doble verificación del estado en el modelo Driver.
            if driver.validate_state != "approved":
                 raise PermissionDenied("El perfil del conductor no está aprobado.")

            # 3. Validar y guardar el vehículo.
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            # Asigna el conductor al vehículo antes de guardarlo.
            serializer.save(driver=driver) 
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response(
                {"error": "Ocurrió un error inesperado.", "detail": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class VehicleListByDriver(APIView):
    """
    Vista para que un conductor autenticado liste todos sus vehículos registrados.
    """
    permission_classes = [IsAuthenticatedCustom]

    @swagger_auto_schema(
        operation_summary="Endpoint para listar mis vehículos (conductor)",
        operation_description="Devuelve una lista de todos los vehículos registrados por el conductor autenticado."
    )
    def get(self, request):
        user = request.user

        if not hasattr(user, 'driver') or user.driver.validate_state != 'approved':
             raise PermissionDenied("Solo los conductores aprobados pueden listar sus vehículos.")

        # Filtra los vehículos que pertenecen al conductor asociado al usuario.
        vehicles = Vehicle.objects.filter(driver=user.driver)
        
        if not vehicles.exists():
            return Response(
                {"message": "No tienes vehículos registrados."},
                status=status.HTTP_200_OK,
            )

        serializer = VehicleSerializer(vehicles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class VehicleDeleteView(APIView):
    """
    Vista para que un conductor autenticado elimine uno de sus vehículos.
    """
    permission_classes = [IsAuthenticatedCustom]

    @swagger_auto_schema(
        operation_summary="Endpoint para eliminar uno de mis vehículos",
        operation_description="Elimina un vehículo específico por su ID, siempre que pertenezca al conductor autenticado."
    )
    def delete(self, request, vehicle_id):
        user = request.user

        if not hasattr(user, 'driver') or user.driver.validate_state != 'approved':
             raise PermissionDenied("Solo los conductores aprobados pueden eliminar vehículos.")

        try:
            # Se busca el vehículo por su ID y asegurando que pertenece al conductor.
            vehicle = Vehicle.objects.get(id=vehicle_id, driver=user.driver)
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

    @swagger_auto_schema(
        operation_summary="Endpoint para obtener los detalles de un vehículo",
        operation_description="Devuelve la información detallada de un vehículo específico por su ID, verificando que pertenezca al conductor que realiza la petición."
    )
    def get(self, request, vehicle_id):
        user = request.user

        if not hasattr(user, 'driver') or user.driver.validate_state != 'approved':
            raise PermissionDenied("Acceso denegado. Solo los conductores aprobados pueden ver sus vehículos.")

        try:
            # Busca el vehículo por su ID.
            vehicle = Vehicle.objects.get(id=vehicle_id)
        except Vehicle.DoesNotExist:
            return Response(
                {"error": "No se encontró un vehículo con el ID proporcionado."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Verifica que el vehículo encontrado pertenezca al conductor que hace la petición.
        if vehicle.driver != user.driver:
            raise PermissionDenied("Este vehículo no te pertenece.")
        
        serializer = VehicleSerializer(vehicle)
        return Response(serializer.data, status=status.HTTP_200_OK)