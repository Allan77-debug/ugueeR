# server/travel/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Travel # Tu modelo Travel
from users.models import Users # Tu modelo Users
from driver.models import Driver # Tu modelo Driver

class LocationConsumer(AsyncWebsocketConsumer):
    """
    Consumer para el rastreo en tiempo real de viajes.
    Maneja la autenticación, autorización y retransmisión de ubicación.
    """

    async def connect(self):
        # Inicializa todos los atributos de instancia que se usarán en otros métodos
        self.travel_id = None
        self.room_group_name = None
        self.travel = None # <--- ASEGURADO QUE ESTÁ INICIALIZADO

        # Obtener datos del scope (adjuntados por JWTAuthMiddleware)
        user = self.scope["user"]
        user_is_authenticated = self.scope["user_is_authenticated"]
        user_type = self.scope["user_type"]
        driver_status = self.scope["driver_status"]
        user_institution_id = self.scope["user_institution_id"]
        is_admin_user = self.scope["is_admin_user"]

        print(f"\n--- DEBUG CONNECT para usuario: {user.full_name} (UID: {user.uid}) ---")
        print(f"  Autenticado: {user_is_authenticated}")
        print(f"  Tipo de usuario (scope): {user_type}")
        print(f"  Estado de conductor (scope): {driver_status}")
        print(f"  ID Institución de usuario (scope): {user_institution_id}")
        print(f"  Es Admin (scope): {is_admin_user}")

        # --- Paso 1: Autenticación básica ---
        if not user_is_authenticated:
            print("Conexión WebSocket rechazada: Usuario no autenticado.")
            await self.close(code=4001) 
            return

        # --- Paso 2: Obtener y validar el ID del viaje de la URL ---
        try:
            self.travel_id = int(self.scope['url_route']['kwargs']['travel_id'])
        except ValueError:
            print("Conexión rechazada: ID de viaje inválido en la URL.")
            await self.close(code=4000) 
            return

        self.room_group_name = f'travel_{self.travel_id}'

        # --- Paso 3: Verificar que el viaje existe y es apto para seguimiento ---
        self.travel = await self._get_travel_object_with_driver_and_institution(self.travel_id)
        if not self.travel: # <--- Si el viaje no se encuentra, se cierra la conexión.
            print(f"Conexión rechazada: Viaje con ID {self.travel_id} no encontrado.")
            await self.close(code=4004) 
            return
        
        # Opcional: No permitir conexiones a viajes finalizados o cancelados
        # Si el viaje se carga, se verifica su estado.
        if self.travel.travel_state in [Travel.TRAVEL_STATES[2][0], Travel.TRAVEL_STATES[3][0]]: # 'completed', 'cancelled'
            print(f"Conexión rechazada: Viaje {self.travel_id} está en estado '{self.travel.travel_state}'.")
            await self.close(code=4005) 
            return

        # --- Paso 4: Autorización para CONECTARSE al grupo del viaje ---
        # ¿Es el conductor asignado a este viaje?
        is_assigned_driver = (
            # Ya no necesitamos user_type == Users.TYPE_DRIVER aquí, solo el driver_status y la asignación
            driver_status == Driver.VALIDATE_STATE_CHOICES[1][0] and # 'approved'
            self.travel.driver.user == user
        )
        print(f"  Es conductor asignado y aprobado para este viaje: {is_assigned_driver}")

        # ¿Es un usuario (pasajero) de la MISMA institución que el conductor del viaje?
        is_same_institution_passenger = (
            user_institution_id is not None and
            self.travel.driver.user.institution is not None and
            user_institution_id == self.travel.driver.user.institution.id_institution and
            user_type in [Users.TYPE_STUDENT, Users.TYPE_EMPLOYEE, Users.TYPE_TEACHER] 
        )
        print(f"  Es pasajero de la misma institución: {is_same_institution_passenger}")


        # ¿Es un administrador de la MISMA institución que el conductor del viaje?
        is_same_institution_admin = (
            is_admin_user and
            user_institution_id is not None and
            self.travel.driver.user.institution is not None and
            user_institution_id == self.travel.driver.user.institution.id_institution
        )
        print(f"  Es administrador de la misma institución: {is_same_institution_admin}")

        # Autorización final para la conexión:
        if not (is_assigned_driver or is_same_institution_passenger or is_same_institution_admin):
            print(f"Conexión rechazada: Usuario {user.full_name} ({user_type}) no autorizado para este viaje o institución.")
            await self.close(code=4003) 
            return

        # Si todo está bien, une la conexión al grupo
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept() # <--- La conexión solo se acepta si todas las validaciones previas son exitosas
        role_connected = "Conductor Asignado y Aprobado" if is_assigned_driver else "Observador (Institución)"
        print(f"✅ WebSocket CONECTADO para el viaje: {self.travel_id} - Usuario: {user.full_name} ({role_connected})")


    async def disconnect(self, close_code):
        if self.room_group_name:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            print(f"❌ WebSocket DESCONECTADO para el viaje: {self.travel_id}")

    async def receive(self, text_data):
        """
        Se ejecuta cuando el servidor recibe un mensaje de un cliente.
        Solo el usuario que tiene un objeto Driver asociado con 'validate_state' = 'approved'
        y es el conductor ASIGNADO del viaje puede enviar actualizaciones de ubicación.
        """
        user = self.scope["user"]
        driver_status = self.scope["driver_status"]

        print(f"\n--- DEBUG RECEIVE para usuario: {user.full_name} (UID: {user.uid}) ---")
        print(f"  Estado de conductor (scope): {driver_status}")
        print(f"  Valor esperado para 'approved': {Driver.VALIDATE_STATE_CHOICES[1][0]}")
        print(f"  ¿Tiene objeto Driver asociado Y está APROBADO?: {driver_status == Driver.VALIDATE_STATE_CHOICES[1][0]}")


        # --- Paso 1: Verificar el estado del remitente como conductor ---
        if not (driver_status == Driver.VALIDATE_STATE_CHOICES[1][0]): 
            print(f"🚫 Usuario {user.full_name} NO tiene un estado de conductor 'aprobado'. Estado actual: {driver_status}")
            await self.send(text_data=json.dumps({"error": "No autorizado: solo conductores aprobados pueden enviar ubicación."}))
            return
        
        # --- Paso 2: Verificar si es el conductor ASIGNADO a este viaje específico ---
        # ESTA ES LA LÍNEA QUE FALLÓ ANTES: if self.travel:
        # Aquí ya sabemos que `self.travel` DEBE existir si la conexión fue exitosa.
        # Si no existe, es un error lógico grave en `connect`.
        
        # Agregamos una comprobación adicional por si acaso, aunque connect debería garantizarlo
        if not self.travel: 
            print("  ERROR CRÍTICO: self.travel no está definido en receive, a pesar de que la conexión fue aceptada.")
            await self.send(text_data=json.dumps({"error": "Error interno del servidor: Viaje no disponible en la sesión."}))
            await self.close(code=4006) # Código de error para estado interno inconsistente
            return

        print(f"  ID de conductor ASIGNADO al viaje ({self.travel.id}): {self.travel.driver.user.uid} (Nombre: {self.travel.driver.user.full_name})")
        print(f"  ID de usuario CONECTADO: {user.uid} (Nombre: {user.full_name})")
        
        if self.travel.driver.user != user: # Compara el objeto Users
            print(f"🚫 Falló la verificación de conductor asignado. (Condición 2)")
            await self.send(text_data=json.dumps({"error": "No autorizado: No es el conductor asignado a este viaje."}))
            return

        print(f"✅ Ambas verificaciones pasadas. Procesando ubicación.")
        try:
            data = json.loads(text_data)
            if 'lat' in data and 'lon' in data:
                print(f"📍 Posición recibida del conductor {user.full_name} para el viaje {self.travel_id}: {data}")

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
            else:
                print(f"Mensaje inválido recibido: {data}")
                await self.send(text_data=json.dumps({"error": "Formato de mensaje inválido. Se esperan 'lat' y 'lon'."}))

        except json.JSONDecodeError:
            print(f"Error: Mensaje malformado JSON recibido en el viaje {self.travel_id}")
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
            # Precarga driver y user de driver, y la institución del user de driver
            return Travel.objects.select_related('driver__user', 'driver__user__institution').get(id=travel_id)
        except Travel.DoesNotExist:
            print(f"DEBUG DB: Viaje con ID {travel_id} no existe.")
            return None
        except Exception as e:
            print(f"DEBUG DB: Error al obtener el objeto Travel {travel_id}: {e}")
            return None