# server/travel/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Travel
from users.models import Users
from driver.models import Driver

class LocationConsumer(AsyncWebsocketConsumer):
    """
    Consumer de WebSocket para gestionar la comunicación en tiempo real de la ubicación
    de un conductor durante un viaje específico.

    Se conecta a una sala (room) específica para un viaje.
    - Los conductores envían actualizaciones de su ubicación a esta sala.
    - Los pasajeros, administradores y la institución suscritos a esta sala reciben
      dichas actualizaciones.
    """

    async def connect(self):
        """
        Maneja el intento de conexión de un nuevo WebSocket.

        Realiza una serie de validaciones de autenticación y autorización antes
        de aceptar la conexión.
        1.  Extrae el ID del viaje de la URL.
        2.  Obtiene el usuario y sus datos (adjuntados por el middleware).
        3.  Verifica que el viaje exista y esté en un estado activo.
        4.  Autoriza la conexión basada en el rol del usuario:
            - El conductor asignado al viaje.
            - Un pasajero o administrador de la misma institución.
            - Una conexión del sistema institucional.
        5.  Si todo es correcto, se une al grupo del canal del viaje.
        """
        # Inicializa las variables de instancia
        self.travel_id = None
        self.room_group_name = None
        self.travel = None

        # Obtener datos del scope (adjuntados por JWTAuthMiddleware)
        user = self.scope.get("user")
        user_is_authenticated = self.scope.get("user_is_authenticated", False)
        user_type = self.scope.get("user_type")
        driver_status = self.scope.get("driver_status")
        user_institution_id = self.scope.get("user_institution_id")
        is_admin_user = self.scope.get("is_admin_user", False)
        is_institution_connection = self.scope.get("is_institution_connection", False)

        # --- Autenticación ---
        # Rechaza la conexión si no es un usuario autenticado ni una conexión del sistema institucional.
        if not user_is_authenticated and not is_institution_connection:
            print("Conexión WebSocket rechazada: No autenticado.")
            await self.close(code=4001)
            return

        # --- Validar ID de viaje ---
        # Extrae y valida el ID del viaje desde la URL.
        try:
            self.travel_id = int(self.scope['url_route']['kwargs']['travel_id'])
        except (ValueError, KeyError):
            print("Conexión rechazada: ID de viaje inválido o no proporcionado.")
            await self.close(code=4000)
            return
        
        # Define el nombre del grupo del canal para este viaje.
        self.room_group_name = f'travel_{self.travel_id}'

        # --- Verificar viaje ---
        # Obtiene el objeto de viaje desde la base de datos de forma asíncrona.
        self.travel = await self._get_travel_object_with_driver_and_institution(self.travel_id)
        if not self.travel:
            print(f"Conexión rechazada: Viaje {self.travel_id} no encontrado.")
            await self.close(code=4004) # Código para 'Not Found'
            return

        # No permitir conexiones a viajes que ya han finalizado.
        if self.travel.travel_state in ['completed', 'cancelled']:
            print(f"Conexión rechazada: Viaje {self.travel_id} finalizado o cancelado.")
            await self.close(code=4005) # Código personalizado para 'viaje terminado'
            return

        # --- Autorización ---
        # Define las condiciones bajo las cuales un usuario puede conectarse.
        
        # Condición 1: Es el conductor asignado al viaje y está aprobado.
        is_assigned_driver = (
            user_is_authenticated and
            driver_status == 'approved' and
            self.travel.driver.user == user
        )

        # Condición 2: Es un pasajero o admin de la misma institución que el conductor.
        is_same_institution_passenger_or_admin = (
            user_is_authenticated and
            user_institution_id is not None and
            self.travel.driver.user.institution is not None and
            user_institution_id == self.travel.driver.user.institution.id_institution and
            (user_type in [Users.TYPE_STUDENT, Users.TYPE_EMPLOYEE, Users.TYPE_TEACHER] or is_admin_user)
        )
        
        # Condición 3: Es una conexión del sistema (otro consumer) para la institución del viaje.
        is_travel_institution = (
            is_institution_connection and
            user_institution_id is not None and
            self.travel.driver.user.institution is not None and
            user_institution_id == self.travel.driver.user.institution.id_institution
        )

        # Si no se cumple ninguna condición, rechazar la conexión.
        if not (is_assigned_driver or is_same_institution_passenger_or_admin or is_travel_institution):
            print(f"Conexión rechazada: No autorizado para el viaje {self.travel_id}.")
            await self.close(code=4003) # Código para 'Forbidden'
            return

        # Unirse al grupo del canal.
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Aceptar la conexión WebSocket.
        await self.accept()
        print(f"✅ WebSocket CONECTADO al viaje: {self.travel_id}")

    async def disconnect(self, close_code):
        """
        Maneja el cierre de la conexión WebSocket.

        Se desuscribe del grupo del canal para dejar de recibir mensajes.
        """
        if self.room_group_name:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            print(f"❌ WebSocket DESCONECTADO del viaje: {self.travel_id} (código: {close_code})")

    async def receive(self, text_data):
        """
        Recibe mensajes del cliente WebSocket.

        Solo el conductor asignado al viaje puede enviar datos de ubicación.
        Estos datos se retransmiten a todos los miembros del grupo del canal.
        """
        user = self.scope["user"]
        driver_status = self.scope.get("driver_status")

        # Verifica que quien envía el mensaje es el conductor aprobado de este viaje.
        if not (driver_status == 'approved' and self.travel and self.travel.driver.user == user):
            await self.send(text_data=json.dumps({"error": "No autorizado para enviar ubicación."}))
            return

        try:
            data = json.loads(text_data)
            # Valida que el mensaje contenga latitud y longitud.
            if 'lat' in data and 'lon' in data:
                # Envía el mensaje al grupo del canal.
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'location_update',  # Esto invoca al método location_update
                        'location': {
                            'lat': data['lat'],
                            'lon': data['lon'],
                            'travel_id': self.travel_id,
                            'driver_name': user.full_name
                        }
                    }
                )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({"error": "Mensaje JSON malformado."}))
        except Exception as e:
            print(f"Error inesperado en receive: {e}")
            await self.send(text_data=json.dumps({"error": "Error interno del servidor."}))

    async def location_update(self, event):
        """
        Manejador para el evento 'location_update'.

        Recibe datos del grupo del canal y los reenvía directamente al cliente WebSocket.
        """
        location_data = event['location']
        await self.send(text_data=json.dumps(location_data))

    @database_sync_to_async
    def _get_travel_object_with_driver_and_institution(self, travel_id):
        """
        Consulta la base de datos de forma asíncrona para obtener un objeto Travel.
        
        Utiliza `select_related` para optimizar la consulta, obteniendo los objetos
        relacionados (Driver, User, Institution) en una sola query.
        """
        try:
            return Travel.objects.select_related('driver__user', 'driver__user__institution').get(id=travel_id)
        except Travel.DoesNotExist:
            return None

class InstitutionMapConsumer(AsyncWebsocketConsumer):
    """
    Consumer de WebSocket para el mapa en vivo de una institución.

    Este consumer está diseñado para ser utilizado por una interfaz de administrador
    o un mapa general de la institución.
    1.  Se conecta a un grupo de "eventos" de la institución.
    2.  Escucha notificaciones de "nuevos viajes iniciados".
    3.  Cuando un nuevo viaje comienza, se suscribe dinámicamente al grupo de
        ese viaje específico (`travel_XXX`) para recibir sus actualizaciones de ubicación.
    4.  También se suscribe a todos los viajes que ya están en progreso al momento de la conexión.
    5.  Reenvía las actualizaciones de ubicación de todos los viajes suscritos al cliente.
    """
    
    async def connect(self):
        """
        Maneja la conexión de un cliente al mapa de la institución.

        1.  Verifica que el usuario esté autenticado y pertenezca a una institución.
        2.  Se suscribe al canal de eventos de la institución.
        3.  Obtiene y se suscribe a los viajes que ya están activos.
        4.  Acepta la conexión.
        """
        # Extrae el usuario y el ID de la institución del scope
        self.user = self.scope.get("user")
        self.institution_id = self.scope.get("user_institution_id")

        # Solo usuarios autenticados y con institución pueden conectarse.
        if not self.user or not self.institution_id:
            await self.close(code=4001) # Código para 'Unauthorized'
            return
        
        # Se suscribe al grupo de EVENTOS de la institución.
        # Aquí recibirá notificaciones de nuevos viajes.
        self.institution_events_group = f'institution_events_{self.institution_id}'
        await self.channel_layer.group_add(
            self.institution_events_group,
            self.channel_name
        )
        
        # Obtiene los viajes que YA están 'in_progress' al momento de conectar
        active_travels = await self._get_active_travels_for_institution(self.institution_id)
        
        # Mantiene una lista de los grupos de viaje a los que está suscrito
        self.subscribed_travel_groups = []
        for travel in active_travels:
            await self.subscribe_to_travel(travel.id)

        await self.accept()
        print(f"✅ MAP CONSUMER: Conectado y escuchando eventos en {self.institution_events_group}")

    async def disconnect(self, close_code):
        """
        Maneja la desconexión del cliente.

        Se desuscribe de todos los grupos a los que se había unido (el de eventos
        y todos los de viajes individuales).
        """
        await self.channel_layer.group_discard(self.institution_events_group, self.channel_name)
        for group_name in self.subscribed_travel_groups:
            await self.channel_layer.group_discard(group_name, self.channel_name)
        print(f"❌ MAP CONSUMER: Desconectado.")

    # Handler para la ubicación que viene de los viajes a los que nos hemos suscrito
    async def location_update(self, event):
        """
        Manejador para el evento 'location_update'.

        Este evento es enviado por `LocationConsumer`. Este consumer lo recibe
        porque se suscribió a los grupos 'travel_XXX'. Lo reenvía al cliente
        del mapa institucional.
        """
        await self.send(text_data=json.dumps(event['location']))
    
    # Handler para la notificación de que un nuevo viaje ha comenzado
    async def new_travel_started(self, event):
        """
        Manejador para el evento 'new_travel_started'.
        
        Este evento es enviado por la señal de Django (`travel.signals`) cuando un
        viaje cambia su estado a 'in_progress'.
        """
        travel_id = event['travel_id']
        print(f"MAP CONSUMER: Recibida notificación de nuevo viaje: {travel_id}. Suscribiendo...")
        await self.subscribe_to_travel(travel_id)

    # Función de ayuda para suscribirse a un grupo de viaje
    async def subscribe_to_travel(self, travel_id):
        """
        Función auxiliar para suscribirse al grupo de un viaje específico.
        Evita suscripciones duplicadas.
        """
        group_name = f'travel_{travel_id}'
        if group_name not in self.subscribed_travel_groups:
            # Aquí se indica que la conexión es de tipo institucional para pasar la autorización en LocationConsumer
            await self.channel_layer.group_add(group_name, self.channel_name)
            self.subscribed_travel_groups.append(group_name)
            print(f"MAP CONSUMER: Suscrito a {group_name}")

    @database_sync_to_async
    def _get_active_travels_for_institution(self, institution_id):
        """
        Consulta la base de datos para obtener los viajes activos ('in_progress')
        de una institución específica.
        """
        # La clave es buscar el estado 'in_progress'
        return list(Travel.objects.filter(
            driver__user__institution_id=institution_id,
            travel_state='in_progress'
        ).select_related('driver__user'))

    async def receive(self, text_data):
        """
        Maneja la recepción de datos. Este consumer es de solo lectura,
        por lo que no procesa mensajes entrantes del cliente.
        """
        # Este consumer solo escucha, no recibe comandos del cliente.
        pass