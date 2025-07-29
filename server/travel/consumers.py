import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Travel
from users.models import Users
from driver.models import Driver

class LocationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
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
        if not user_is_authenticated and not is_institution_connection:
            print("Conexión WebSocket rechazada: No autenticado.")
            await self.close(code=4001)
            return

        # --- Validar ID de viaje ---
        try:
            self.travel_id = int(self.scope['url_route']['kwargs']['travel_id'])
        except ValueError:
            print("Conexión rechazada: ID de viaje inválido.")
            await self.close(code=4000)
            return
        
        self.room_group_name = f'travel_{self.travel_id}'

        # --- Verificar viaje ---
        self.travel = await self._get_travel_object_with_driver_and_institution(self.travel_id)
        if not self.travel:
            print(f"Conexión rechazada: Viaje {self.travel_id} no encontrado.")
            await self.close(code=4004)
            return

        if self.travel.travel_state in ['completed', 'cancelled']:
            print(f"Conexión rechazada: Viaje {self.travel_id} finalizado o cancelado.")
            await self.close(code=4005)
            return

        # --- Autorización ---
        is_assigned_driver = (
            user_is_authenticated and
            driver_status == 'approved' and
            self.travel.driver.user == user
        )

        is_same_institution_passenger_or_admin = (
            user_is_authenticated and
            user_institution_id is not None and
            self.travel.driver.user.institution is not None and
            user_institution_id == self.travel.driver.user.institution.id_institution and
            (user_type in [Users.TYPE_STUDENT, Users.TYPE_EMPLOYEE, Users.TYPE_TEACHER] or is_admin_user)
        )
        
        is_travel_institution = (
            is_institution_connection and
            user_institution_id is not None and
            self.travel.driver.user.institution is not None and
            user_institution_id == self.travel.driver.user.institution.id_institution
        )

        if not (is_assigned_driver or is_same_institution_passenger_or_admin or is_travel_institution):
            print(f"Conexión rechazada: No autorizado para el viaje {self.travel_id}.")
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        print(f"✅ WebSocket CONECTADO al viaje: {self.travel_id}")

    async def disconnect(self, close_code):
        if self.room_group_name:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            print(f"❌ WebSocket DESCONECTADO del viaje: {self.travel_id}")

    async def receive(self, text_data):
        user = self.scope["user"]
        driver_status = self.scope.get("driver_status")

        # Solo el conductor asignado y aprobado puede enviar datos
        if not (driver_status == 'approved' and self.travel and self.travel.driver.user == user):
            await self.send(text_data=json.dumps({"error": "No autorizado para enviar ubicación."}))
            return

        try:
            data = json.loads(text_data)
            if 'lat' in data and 'lon' in data:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'location_update',
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
        location_data = event['location']
        await self.send(text_data=json.dumps(location_data))

    @database_sync_to_async
    def _get_travel_object_with_driver_and_institution(self, travel_id):
        try:
            return Travel.objects.select_related('driver__user', 'driver__user__institution').get(id=travel_id)
        except Travel.DoesNotExist:
            return None
class InstitutionMapConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        self.user = self.scope.get("user")
        self.institution_id = self.scope.get("user_institution_id")

        if not self.user or not self.institution_id:
            await self.close(code=4001)
            return
        
        # Suscribirse al grupo de EVENTOS de la institución.
        # Aquí recibirá notificaciones de nuevos viajes.
        self.institution_events_group = f'institution_events_{self.institution_id}'
        await self.channel_layer.group_add(
            self.institution_events_group,
            self.channel_name
        )
        
        # Obtener los viajes que YA están 'in_progress' al momento de conectar
        active_travels = await self._get_active_travels_for_institution(self.institution_id)
        
        self.subscribed_travel_groups = []
        for travel in active_travels:
            await self.subscribe_to_travel(travel.id)

        await self.accept()
        print(f"✅ MAP CONSUMER: Conectado y escuchando eventos en {self.institution_events_group}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.institution_events_group, self.channel_name)
        for group_name in self.subscribed_travel_groups:
            await self.channel_layer.group_discard(group_name, self.channel_name)
        print(f"❌ MAP CONSUMER: Desconectado.")
    
    # Handler para la ubicación que viene de los viajes a los que nos hemos suscrito
    async def location_update(self, event):
        await self.send(text_data=json.dumps(event['location']))
        
    # Handler para la notificación de que un nuevo viaje ha comenzado
    async def new_travel_started(self, event):
        travel_id = event['travel_id']
        print(f"MAP CONSUMER: Recibida notificación de nuevo viaje: {travel_id}. Suscribiendo...")
        await self.subscribe_to_travel(travel_id)

    # Función de ayuda para suscribirse a un grupo de viaje
    async def subscribe_to_travel(self, travel_id):
        group_name = f'travel_{travel_id}'
        if group_name not in self.subscribed_travel_groups:
            await self.channel_layer.group_add(group_name, self.channel_name)
            self.subscribed_travel_groups.append(group_name)
            print(f"MAP CONSUMER: Suscrito a {group_name}")

    @database_sync_to_async
    def _get_active_travels_for_institution(self, institution_id):
        # La clave es buscar el estado 'in_progress'
        return list(Travel.objects.filter(
            driver__user__institution_id=institution_id,
            travel_state='in_progress'
        ).select_related('driver__user'))

    async def receive(self, text_data):
        # Este consumer solo escucha
        pass