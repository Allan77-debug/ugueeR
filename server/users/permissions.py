# server/users/permissions.py
import jwt
from django.conf import settings
from rest_framework.permissions import BasePermission
import logging

# Configuración del logger para registrar eventos importantes o errores.
logger = logging.getLogger(__name__)

# Importar el modelo Users.
from users.models import Users

class IsAuthenticatedCustom(BasePermission):
    """
    Clase de permiso personalizada para DRF (Django Rest Framework).
    Permite el acceso solo a usuarios autenticados, validando un token JWT
    proporcionado en la cabecera de la petición.
    """
    
    def has_permission(self, request, view):
        """
        Verifica si un usuario tiene permiso para acceder a una vista.
        
        El proceso es el siguiente:
        1. Extrae la cabecera 'Authorization'.
        2. Valida que el formato sea 'Bearer <token>'.
        3. Extrae el token.
        4. Decodifica el token usando la SECRET_KEY del proyecto.
        5. Extrae el 'user_id' del contenido (payload) del token.
        6. Busca al usuario en la base de datos con ese ID.
        7. Si todo es exitoso, adjunta el objeto 'user' a la petición y devuelve True.
        8. Si ocurre cualquier error (token expirado, inválido, usuario no encontrado),
           registra el error y devuelve False.
        """
        try:
            # 1. Obtener la cabecera de autorización.
            authorization_header = request.META.get('HTTP_AUTHORIZATION')
            if not authorization_header:
                logger.warning("No se proporcionó la cabecera de Autorización.")
                return False

            # 2. Validar el formato del token.
            if ' ' not in authorization_header:
                logger.warning("Cabecera de Autorización malformada (no se encontró espacio).")
                return False

            token_parts = authorization_header.split(' ')
            if len(token_parts) != 2 or token_parts[0].lower() != 'bearer':
                logger.warning(f"Cabecera de Autorización malformada: {authorization_header}")
                return False

            # 3. Extraer el token.
            token = token_parts[1]

            if not settings.SECRET_KEY:
                logger.error("La SECRET_KEY no está configurada en settings.py.")
                return False

            # 4. Decodificar el token.
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=['HS256']
            )

            # 5. Extraer el ID del usuario del payload.
            user_id = payload.get('user_id')
            if not user_id:
                logger.warning("El contenido del token no incluye 'user_id'.")
                return False

            # 6. Buscar al usuario y adjuntarlo a la petición.
            # Esto permite que en las vistas se pueda usar `request.user`.
            request.user = Users.objects.get(uid=user_id)
            return True

        # 8. Manejo de excepciones específicas.
        except jwt.ExpiredSignatureError:
            logger.warning("El token JWT ha expirado.")
            return False
        except jwt.InvalidTokenError:
            logger.warning("Token JWT inválido.")
            return False
        except Users.DoesNotExist:
            logger.warning(f"Usuario con uid '{user_id}' no encontrado.")
            return False
        except Exception as e:
            logger.error(f"Ocurrió un error inesperado en IsAuthenticatedCustom: {e}", exc_info=True)
            return False