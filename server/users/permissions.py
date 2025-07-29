# users/permissions.py
import jwt
from django.conf import settings
from rest_framework.permissions import BasePermission
import logging

logger = logging.getLogger(__name__)

# ¡Importante! Asegúrate de que esta ruta sea correcta para tu modelo Users
from users.models import Users

class IsAuthenticatedCustom(BasePermission):
    """
    Permite el acceso solo a usuarios autenticados usando validación JWT personalizada.
    """
    def has_permission(self, request, view):
        try:
            authorization_header = request.META.get('HTTP_AUTHORIZATION')
            if not authorization_header:
                logger.warning("No Authorization header provided.")
                return False

            if ' ' not in authorization_header:
                logger.warning("Authorization header malformed (no space found).")
                return False

            token_parts = authorization_header.split(' ')
            if len(token_parts) != 2 or token_parts[0].lower() != 'bearer':
                logger.warning(f"Authorization header malformed: {authorization_header}")
                return False

            token = token_parts[1]

            if not settings.SECRET_KEY:
                logger.error("settings.SECRET_KEY is not configured.")
                return False

            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=['HS256']
            )

            user_id = payload.get('user_id')
            if not user_id:
                logger.warning("Token payload missing 'user_id'.")
                return False

            request.user = Users.objects.get(uid=user_id)
            return True

        except jwt.ExpiredSignatureError:
            logger.warning("JWT Token has expired.")
            return False
        except jwt.InvalidTokenError:
            logger.warning("Invalid JWT Token.")
            return False
        except Users.DoesNotExist:
            logger.warning(f"User with uid '{user_id}' not found.")
            return False
        except Exception as e:
            logger.error(f"An unexpected error occurred in IsAuthenticatedCustom: {e}", exc_info=True)
            return False