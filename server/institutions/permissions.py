# server/institutions/permissions.py

import jwt
from django.conf import settings
from rest_framework.permissions import BasePermission
import logging
from .models import Institution

logger = logging.getLogger(__name__)

class IsInstitutionAuthenticated(BasePermission):
    """
    Clase de permiso personalizado para Django REST Framework.

    Permite el acceso a una vista solo si la petición contiene un token JWT válido
    que corresponde a una institución existente. A diferencia de la autenticación
    de usuarios, este permiso busca 'institution_id' en el contenido del token.
    """
    def has_permission(self, request, view):
        """
        Verifica si el solicitante tiene permiso para acceder a la vista.
        Se ejecuta para cada petición a una vista que use este permiso.
        """
        try:
            # Extrae el header 'Authorization' de la petición.
            authorization_header = request.META.get('HTTP_AUTHORIZATION')
            if not authorization_header or ' ' not in authorization_header:
                return False

            # El header debe tener el formato "Bearer <token>".
            token_type, token = authorization_header.split(' ')
            if token_type.lower() != 'bearer':
                return False

            # Decodifica el token para leer su contenido (payload).
            # Lanza una excepción si el token ha expirado o es inválido.
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=['HS256']
            )

            # La lógica clave: busca 'institution_id' en el payload.
            institution_id = payload.get('institution_id')
            if not institution_id:
                logger.warning("Token JWT no contiene 'institution_id'.")
                return False

            # Busca la institución en la base de datos y la adjunta al objeto 'request'.
            # Esto permite que las vistas accedan a la institución autenticada
            # de forma sencilla a través de `request.institution`.
            request.institution = Institution.objects.get(id_institution=institution_id)
            return True

        except jwt.ExpiredSignatureError:
            logger.warning("Token de institución ha expirado.")
            return False
        except jwt.InvalidTokenError:
            logger.warning("Token de institución inválido.")
            return False
        except Institution.DoesNotExist:
            logger.warning(f"Institución con id '{institution_id}' no encontrada en el token.")
            return False
        except Exception as e:
            logger.error(f"Error inesperado en IsInstitutionAuthenticated: {e}", exc_info=True)
            return False