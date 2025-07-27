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
            scope['driver_status'] = None
            scope['user_institution_id'] = None
            scope['is_admin_user'] = False
            scope['is_institution_connection'] = False # Nuevo campo en el scope

            if token:
                # Intenta decodificar el token para ver si es de usuario o de institución
                try:
                    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                    
                    # Si el token contiene 'user_id', es un token de usuario
                    if 'user_id' in payload:
                        user_instance = await self._get_user_from_token(payload)
                        if user_instance:
                            print(f"DEBUG MIDDLEWARE: Usuario autenticado: {user_instance.full_name}, UID: {user_instance.uid}")
                            scope['user'] = user_instance
                            scope['user_is_authenticated'] = True
                            scope['user_type'] = user_instance.user_type
                            
                            if user_instance.institution:
                                scope['user_institution_id'] = user_instance.institution.id_institution
                                print(f"DEBUG MIDDLEWARE: Institución del usuario: {user_instance.institution.official_name} (ID: {user_instance.institution.id_institution})")

                            driver_obj = await self._get_driver_object(user_instance)
                            if driver_obj:
                                scope['driver_status'] = driver_obj.validate_state
                                print(f"DEBUG MIDDLEWARE: Objeto Driver ENCONTRADO para {user_instance.full_name}, Estado: {scope['driver_status']}")
                            
                            if user_instance.user_type == Users.TYPE_ADMIN:
                                scope['is_admin_user'] = True
                                print(f"DEBUG MIDDLEWARE: Es Admin: {scope['is_admin_user']}")

                    # Si el token contiene 'institution_id', es un token de institución
                    elif 'institution_id' in payload:
                        institution_id = payload.get('institution_id')
                        institution = await self._get_institution_from_id(institution_id)
                        if institution:
                            print(f"DEBUG MIDDLEWARE: Conexión de Institución autenticada: {institution.official_name} (ID: {institution.id_institution})")
                            scope['is_institution_connection'] = True
                            scope['user_institution_id'] = institution.id_institution # Guardamos el ID de la institución para la autorización
                    
                    else:
                        print("DEBUG MIDDLEWARE: Token inválido. No contiene 'user_id' ni 'institution_id'.")

                except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
                    print(f"JWT Token error during WebSocket authentication: {e}")
                except Exception as e:
                    print(f"Unexpected error in JWTAuthMiddleware: {e}")
            else:
                print("DEBUG MIDDLEWARE: No se encontró token en el query string.")
                
        return await self.inner(scope, receive, send)

    @database_sync_to_async
    def _get_user_from_token(self, payload):
        try:
            user_uid = payload.get('user_id')
            if user_uid:
                return Users.objects.select_related('institution').get(uid=user_uid)
            return None
        except Users.DoesNotExist:
            return None
    
    @database_sync_to_async
    def _get_driver_object(self, user_instance):
        try:
            return user_instance.driver
        except Driver.DoesNotExist:
            return None
            
    @database_sync_to_async
    def _get_institution_from_id(self, institution_id):
        try:
            return Institution.objects.get(id_institution=institution_id)
        except Institution.DoesNotExist:
            return None