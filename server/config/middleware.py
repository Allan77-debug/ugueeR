# server/config/middleware.py

import jwt
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from urllib.parse import parse_qs

# Importamos los modelos para hacer consultas a la base de datos.
from users.models import Users
from driver.models import Driver
from institutions.models import Institution

class JWTAuthMiddleware:
    """
    Middleware para Channels que autentica usuarios de WebSocket a través de un token JWT.
    El token se espera como un query parameter en la URL (ej: ?token=ey...).
    """
    def __init__(self, inner):
        # 'inner' es la siguiente capa en la pila de ASGI (en nuestro caso, el URLRouter).
        self.inner = inner

    async def __call__(self, scope, receive, send):
        """
        Este método se ejecuta para cada conexión WebSocket entrante.
        """
        # Nos aseguramos de que solo se aplique a conexiones de tipo 'websocket'.
        if scope['type'] == 'websocket':
            # Decodifica y parsea el query string (ej: 'token=abc&foo=bar') a un diccionario.
            query_string = parse_qs(scope['query_string'].decode())
            # Obtenemos el valor del token. Si no existe, es None.
            token = query_string.get('token', [None])[0]

            # Inicializamos el 'scope' (el diccionario de estado de la conexión)
            # con valores por defecto seguros.
            scope['user'] = AnonymousUser()
            scope['user_is_authenticated'] = False
            scope['user_type'] = None
            scope['driver_status'] = None
            scope['user_institution_id'] = None
            scope['is_admin_user'] = False
            scope['is_institution_connection'] = False

            if token:
                try:
                    # Decodificamos el token para acceder a su payload (contenido).
                    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                    
                    # --- LÓGICA DE AUTENTICACIÓN DE USUARIO ---
                    if 'user_id' in payload:
                        user_instance = await self._get_user_from_token(payload)
                        if user_instance:
                            # Si el usuario existe, poblamos el 'scope' con su información.
                            # Los consumers tendrán acceso a estos datos.
                            scope['user'] = user_instance
                            scope['user_is_authenticated'] = True
                            scope['user_type'] = user_instance.user_type
                            
                            if user_instance.institution:
                                scope['user_institution_id'] = user_instance.institution.id_institution

                            # Verificamos si este usuario tiene un perfil de conductor asociado.
                            driver_obj = await self._get_driver_object(user_instance)
                            if driver_obj:
                                scope['driver_status'] = driver_obj.validate_state
                            
                            if user_instance.user_type == Users.TYPE_ADMIN:
                                scope['is_admin_user'] = True

                    # --- LÓGICA DE AUTENTICACIÓN DE INSTITUCIÓN ---
                    elif 'institution_id' in payload:
                        institution_id = payload.get('institution_id')
                        institution = await self._get_institution_from_id(institution_id)
                        if institution:
                            # Marcamos esta conexión como una conexión de nivel institucional.
                            scope['is_institution_connection'] = True
                            scope['user_institution_id'] = institution.id_institution
                    
                except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
                    # El token es inválido o ha expirado. No hacemos nada y el usuario
                    # permanecerá como AnonymousUser.
                    print("Error de autenticación WebSocket: Token inválido o expirado.")
                except Exception as e:
                    print(f"Error inesperado en JWTAuthMiddleware: {e}")
        
        # Pasamos la conexión (con el 'scope' ya poblado) a la siguiente capa.
        return await self.inner(scope, receive, send)

    @database_sync_to_async
    def _get_user_from_token(self, payload):
        """
        Método asíncrono para buscar un usuario en la BD a partir del payload del token.
        Usa un decorador para permitir llamadas a la BD síncrona de Django.
        """
        try:
            user_uid = payload.get('user_id')
            if user_uid:
                # 'select_related' optimiza la consulta para obtener la institución en el mismo query.
                return Users.objects.select_related('institution').get(uid=user_uid)
            return None
        except Users.DoesNotExist:
            return None
    
    @database_sync_to_async
    def _get_driver_object(self, user_instance):
        """Busca el perfil de conductor asociado a una instancia de usuario."""
        try:
            # Gracias a la relación OneToOne, podemos acceder así.
            return user_instance.driver
        except Driver.DoesNotExist:
            return None
            
    @database_sync_to_async
    def _get_institution_from_id(self, institution_id):
        """Busca una institución en la BD por su ID."""
        try:
            return Institution.objects.get(id_institution=institution_id)
        except Institution.DoesNotExist:
            return None