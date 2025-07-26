

from rest_framework.permissions import BasePermission

class IsOwner(BasePermission):
    """
    Permiso personalizado para permitir que solo el creador de un objeto
    pueda editarlo o eliminarlo.
    """
    message = "No tienes permiso para realizar esta acción sobre este objeto."

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user