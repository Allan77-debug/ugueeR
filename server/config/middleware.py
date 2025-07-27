# config/middleware.py

import jwt
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from urllib.parse import parse_qs

# Importa tus modelos directamente
from users.models import Users
from driver.models import Driver
from institutions.models import Institution 

class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        if scope['type'] == 'websocket':
            query_string = parse_qs(scope['query_string'].decode())
            token = query_string.get('token', [None])[0]

            # Inicializa el scope con valores predeterminados seguros
            scope['user'] = AnonymousUser()
            scope['user_is_authenticated'] = False
            scope['user_type'] = None
            scope['driver_status'] = None # <-- Se inicializa a None
            scope['user_institution_id'] = None 
            scope['is_admin_user'] = False 

            if token:
                user_instance = await self._get_user_from_token(token)
                if user_instance:
                    print(f"DEBUG MIDDLEWARE: Usuario autenticado: {user_instance.full_name}, UID: {user_instance.uid}")
                    scope['user'] = user_instance
                    scope['user_is_authenticated'] = True
                    scope['user_type'] = user_instance.user_type # El tipo de usuario sigue siendo importante para otros roles
                    
                    if user_instance.institution:
                        scope['user_institution_id'] = user_instance.institution.id_institution
                        print(f"DEBUG MIDDLEWARE: Institución del usuario: {user_instance.institution.official_name} (ID: {user_instance.institution.id_institution})")

                    # CAMBIO CLAVE: Siempre intenta obtener el objeto Driver
                    # No importa el user_type del Users. Es la existencia del objeto Driver lo que importa.
                    driver_obj = await self._get_driver_object(user_instance)
                    if driver_obj:
                        scope['driver_status'] = driver_obj.validate_state
                        print(f"DEBUG MIDDLEWARE: Objeto Driver ENCONTRADO para {user_instance.full_name}, Estado: {scope['driver_status']}")
                    else:
                        print(f"DEBUG MIDDLEWARE: Objeto Driver NO ENCONTRADO para {user_instance.full_name}. driver_status permanecerá None.")
                    
                    if user_instance.user_type == Users.TYPE_ADMIN:
                        scope['is_admin_user'] = True
                        print(f"DEBUG MIDDLEWARE: Es Admin: {scope['is_admin_user']}")
                else:
                    print(f"DEBUG MIDDLEWARE: No se pudo obtener el objeto Users para el token proporcionado.")
            else:
                print("DEBUG MIDDLEWARE: No se encontró token en el query string.")
                
        return await self.inner(scope, receive, send)

    @database_sync_to_async
    def _get_user_from_token(self, token):
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=['HS256']
            )
            user_uid = payload.get('user_id') 
            if user_uid:
                return Users.objects.select_related('institution').get(uid=user_uid)
            return None
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, Users.DoesNotExist) as e:
            print(f"JWT Token error during WebSocket authentication in _get_user_from_token: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error in _get_user_from_token: {e}")
            return None
            
    @database_sync_to_async
    def _get_driver_object(self, user_instance):
        try:
            return user_instance.driver # Esto funciona si existe el OneToOneField
        except Driver.DoesNotExist:
            return None
        except Exception as e:
            print(f"DEBUG MIDDLEWARE: Error getting driver object for user {user_instance.uid}: {e}")
            return None