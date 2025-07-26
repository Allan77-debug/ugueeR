# server/travel/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class LocationConsumer(AsyncWebsocketConsumer):
    # Se ejecuta cuando un cliente intenta conectarse
    async def connect(self):
        # 1. Obtenemos el ID del viaje desde la URL
        self.travel_id = self.scope['url_route']['kwargs']['travel_id']
        self.room_group_name = f'travel_{self.travel_id}'

        # 2. El cliente se une a un "grupo" o "sala" de chat específica del viaje
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        # 3. Aceptamos la conexión
        await self.accept()
        print(f"Socket conectado al viaje: {self.travel_id}")

    # Se ejecuta cuando el cliente se desconecta
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        print(f"Socket desconectado del viaje: {self.travel_id}")

    # Se ejecuta cuando el servidor recibe un mensaje del cliente (conductor)
    async def receive(self, text_data):
        data = json.loads(text_data)
        lat = data['lat']
        lon = data['lon']

        # (Opcional) Aquí guardarías las coordenadas en la base de datos (PostGIS)

        # 4. Retransmitimos el mensaje a todos en el grupo (al pasajero)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'location_update', # Esto llama a la función location_update
                'location': {
                    'lat': lat,
                    'lon': lon
                }
            }
        )
    
    # Esta función es llamada por el group_send y envía los datos al cliente
    async def location_update(self, event):
        location_data = event['location']
        await self.send(text_data=json.dumps(location_data))