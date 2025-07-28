import jwt
from django.conf import settings
from rest_framework.permissions import BasePermission
import logging

from .models import Institution # Importamos el modelo Institution

logger = logging.getLogger(__name__)

class IsInstitutionAuthenticated(BasePermission):
    """
    Permite el acceso solo a instituciones autenticadas usando validación JWT.
    Busca 'institution_id' en el payload del token.
    """
    def has_permission(self, request, view):
        try:
            # La lógica para extraer el token del header es idéntica
            authorization_header = request.META.get('HTTP_AUTHORIZATION')
            if not authorization_header or ' ' not in authorization_header:
                return False

            token_type, token = authorization_header.split(' ')
            if token_type.lower() != 'bearer':
                return False

            # Decodificamos el token
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=['HS256']
            )

            # --- LA LÓGICA CLAVE CAMBIA AQUÍ ---
            # En lugar de 'user_id', buscamos 'institution_id'
            institution_id = payload.get('institution_id')
            if not institution_id:
                logger.warning("Token de institución no contiene 'institution_id'.")
                return False

            # Buscamos la institución y la adjuntamos al request para uso futuro
            # Es una buena práctica usar un nombre diferente a 'request.user'
            request.institution = Institution.objects.get(id_institution=institution_id)
            return True

        except jwt.ExpiredSignatureError:
            logger.warning("Token de institución ha expirado.")
            return False
        except jwt.InvalidTokenError:
            logger.warning("Token de institución inválido.")
            return False
        except Institution.DoesNotExist:
            logger.warning(f"Institución con id '{institution_id}' no encontrada.")
            return False
        except Exception as e:
            logger.error(f"Error inesperado en IsInstitutionAuthenticated: {e}", exc_info=True)
            return False