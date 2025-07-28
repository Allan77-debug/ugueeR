"""
Define permisos personalizados para la aplicación 'assessment'.

Estos permisos se utilizan en las vistas para controlar el acceso y las acciones
que los usuarios pueden realizar sobre los objetos de calificación.
"""
from rest_framework.permissions import BasePermission

class IsOwner(BasePermission):
    """
    Permiso personalizado para permitir que solo el creador de un objeto
    pueda editarlo o eliminarlo.
    """
    # Mensaje de error que se mostrará si el permiso es denegado.
    message = "No tienes permiso para realizar esta acción sobre este objeto."

    def has_object_permission(self, request, view, obj):
        """
        Verifica si el usuario que realiza la petición es el propietario del objeto.
        
        Args:
            request: El objeto de la petición.
            view: La vista que invoca el permiso.
            obj: La instancia del modelo (en este caso, una 'Assessment') a la que se accede.
            
        Returns:
            bool: True si el usuario de la petición es el mismo que el usuario del objeto, False en caso contrario.
        """
        # Compara el usuario asociado a la calificación (obj.user) con el usuario
        # autenticado en la petición (request.user).
        return obj.user == request.user