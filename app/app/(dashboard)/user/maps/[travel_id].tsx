import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Alert, Platform } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import { Button } from "@/components/ui/button";
import * as Location from 'expo-location';
import { useSession } from '@/hooks/ctx';
import { SafeAreaView } from "react-native-safe-area-context";

// Interface para los datos del WebSocket (igual que en tus archivos HTML)
interface WebSocketLocationData {
  travel_id: number;
  driver_name: string;
  lat: number;
  lon: number;
  speed?: number;
}

// Interface para vehículos en tiempo real
interface Vehicle {
  id: number;
  travel_id: number;
  position: { latitude: number; longitude: number };
  driver: string;
  plate: string;
  available: boolean;
  vehicleType: string;
  destination: string;
  rating: number;
  estimatedTime: string;
  speed?: number;
  lastUpdate: Date;
}

// Coordenadas iniciales (Cali, Colombia - como en tus archivos)
const initialRegion: Region = {
  latitude: 3.4516,
  longitude: -76.532,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const RealTimeMap = () => {
  const { session } = useSession();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [institutionSocket, setInstitutionSocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [isTracking, setIsTracking] = useState(false);
  const [travelId, setTravelId] = useState<number>(21); // Hardcodeado por ahora
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  // Inicializar automáticamente cuando el componente se monta
  useEffect(() => {
    initializeServices();
    return () => cleanup();
  }, []);

  const initializeServices = async () => {
    await requestLocationPermission();
    connectToInstitutionMap();
    startLocationTracking();
  };

  // Solicitar permisos de ubicación
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Se necesitan permisos de ubicación para esta funcionalidad');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      return false;
    }
  };

  // Conectar al WebSocket institucional para recibir ubicaciones de otros vehículos
  const connectToInstitutionMap = () => {
    if (!session?.token) {
      console.error('No se encontró token de sesión para el mapa institucional');
      return;
    }

    if (institutionSocket) {
      institutionSocket.close();
    }

    // Usar la misma URL que en map_client.html
    const websocketUrl = `ws://192.168.56.1:8000/ws/institution/live_map/?token=${session.token}`;
    console.log('🗺️ Conectando al WebSocket institucional:', websocketUrl);
    
    const newSocket = new WebSocket(websocketUrl);

    newSocket.onopen = () => {
      console.log('✅ WebSocket institucional conectado - Escuchando vehículos');
      setConnectionStatus('connected');
    };

    newSocket.onmessage = (event) => {
      try {
        const data: WebSocketLocationData = JSON.parse(event.data);
        
        if ((data as any).error) {
          console.error('Error desde el servidor:', (data as any).error);
          return;
        }

        const { travel_id, driver_name, lat, lon, speed } = data;
        console.log(`📍 Viaje ${travel_id} (${driver_name}) -> Lat: ${lat}, Lon: ${lon}`);

        // Actualizar o agregar vehículo
        setVehicles(prevVehicles => {
          const existingVehicleIndex = prevVehicles.findIndex(v => v.travel_id === travel_id);
          
          if (existingVehicleIndex !== -1) {
            // Actualizar vehículo existente
            const updatedVehicles = [...prevVehicles];
            updatedVehicles[existingVehicleIndex] = {
              ...updatedVehicles[existingVehicleIndex],
              position: { latitude: lat, longitude: lon },
              driver: driver_name,
              speed,
              lastUpdate: new Date(),
              estimatedTime: "En tiempo real"
            };
            return updatedVehicles;
          } else {
            // Agregar nuevo vehículo
            const newVehicle: Vehicle = {
              id: travel_id,
              travel_id,
              position: { latitude: lat, longitude: lon },
              driver: driver_name,
              plate: `VEH-${travel_id}`,
              available: false, // En movimiento
              vehicleType: "En servicio",
              destination: "En ruta",
              rating: 4.5,
              estimatedTime: "En tiempo real",
              speed,
              lastUpdate: new Date()
            };
            return [...prevVehicles, newVehicle];
          }
        });

      } catch (error) {
        console.error('Error procesando mensaje del WebSocket institucional:', error);
      }
    };

    newSocket.onclose = (event) => {
      const reason = event.reason ? `, Razón: ${event.reason}` : '';
      console.log(`❌ WebSocket institucional desconectado. Código: ${event.code}${reason}`);
      
      // Intentar reconectar después de 5 segundos
      setTimeout(() => {
        console.log('🔄 Intentando reconectar al mapa institucional...');
        connectToInstitutionMap();
      }, 5000);
    };

    newSocket.onerror = (error) => {
      console.error('🔥 Error en la conexión WebSocket institucional:', error);
      setConnectionStatus('error');
    };

    setInstitutionSocket(newSocket);
  };

  // Conectar al WebSocket para enviar mi ubicación (como conductor)
  const connectToDriverWebSocket = (travelId: number) => {
    if (!session?.token) {
      console.error('No se encontró token de sesión');
      return;
    }

    if (socket) {
      socket.close();
    }

    // Usar la misma URL que en driver_client.html
    const websocketUrl = `ws://192.168.56.1:8000/ws/travel/${travelId}/?token=${session.token}`;
    console.log('🚗 Conectando al WebSocket del conductor:', websocketUrl);
    
    const newSocket = new WebSocket(websocketUrl);

    newSocket.onopen = () => {
      console.log('✅ WebSocket del conductor conectado al viaje:', travelId);
    };

    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          console.error('Error desde el servidor del conductor:', data.error);
          return;
        }
        console.log('📍 Eco del servidor (conductor):', data);
      } catch (error) {
        console.error('Error procesando mensaje del WebSocket del conductor:', error);
      }
    };

    newSocket.onclose = (event) => {
      console.log(`❌ WebSocket del conductor desconectado. Código: ${event.code}`);
    };

    newSocket.onerror = (error) => {
      console.error('🔥 Error en la conexión WebSocket del conductor:', error);
    };

    setSocket(newSocket);
  };

  // Iniciar seguimiento de ubicación
  const startLocationTracking = async () => {
    try {
      console.log('📍 Iniciando seguimiento de ubicación...');
      
      // Conectar al WebSocket del conductor
      connectToDriverWebSocket(travelId);

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000, // Cada 3 segundos como en driver_client.html
          distanceInterval: 5, // Cada 5 metros
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          const speed = location.coords.speed || 0;

          // Actualizar ubicación del usuario
          setUserLocation({ latitude, longitude });

          // Centrar el mapa en mi ubicación
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }, 1000);
          }

          // Enviar ubicación por WebSocket si está conectado
          if (socket && socket.readyState === WebSocket.OPEN) {
            const locationData = {
              lat: latitude,
              lon: longitude,
              speed: speed * 3.6, // Convertir m/s a km/h
            };

            socket.send(JSON.stringify(locationData));
            console.log('➡️ Ubicación enviada:', locationData);
          }
        }
      );

      locationSubscription.current = subscription;
      setIsTracking(true);
      console.log('📍 Seguimiento de ubicación iniciado');

    } catch (error) {
      console.error('Error iniciando seguimiento:', error);
      Alert.alert('Error', 'No se pudo iniciar el seguimiento de ubicación');
    }
  };

  // Detener seguimiento
  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    if (socket) {
      socket.close();
      setSocket(null);
    }

    setIsTracking(false);
    setUserLocation(null);
    console.log('🛑 Seguimiento de ubicación detenido');
  };

  // Cleanup
  const cleanup = () => {
    stopLocationTracking();
    
    if (institutionSocket) {
      institutionSocket.close();
      setInstitutionSocket(null);
    }
    
    setConnectionStatus('disconnected');
  };

  // Limpiar vehículos que no han enviado datos recientemente
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = new Date();
      setVehicles(prev => prev.filter(vehicle => {
        const timeDiff = now.getTime() - vehicle.lastUpdate.getTime();
        return timeDiff < 60000; // Eliminar si no hay datos en 1 minuto
      }));
    }, 30000); // Verificar cada 30 segundos

    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        provider="google"
        showsUserLocation={true}
        followsUserLocation={isTracking}
        className="flex-1"
      >
        {/* Marcadores de vehículos en tiempo real */}
        {vehicles.map(vehicle => (
          <Marker
            key={`vehicle-${vehicle.travel_id}`}
            coordinate={vehicle.position}
            pinColor={vehicle.available ? "green" : "orange"}
            title={`${vehicle.driver} - Viaje ${vehicle.travel_id}`}
            description={`${vehicle.vehicleType} | ${vehicle.estimatedTime} | ${vehicle.speed ? `${vehicle.speed.toFixed(1)} km/h` : 'Sin velocidad'}`}
          />
        ))}

        {/* Mi ubicación */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Mi ubicación"
            description="Transmitiendo en tiempo real"
            pinColor="blue"
          />
        )}
      </MapView>

      {/* Panel de estado */}
      {/* <View className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md">
        <Text className="font-bold mb-1 text-foreground">Estado del Mapa</Text>
        <Text className="text-sm">
          Conexión: {connectionStatus === 'connected' ? '🟢 En vivo' : 
                    connectionStatus === 'connecting' ? '🟡 Conectando...' :
                    connectionStatus === 'error' ? '🔴 Error' : '⚫ Desconectado'}
        </Text>
        <Text className="text-sm">
          Mi ubicación: {isTracking ? '🟢 Transmitiendo' : '🔴 Detenida'}
        </Text>
        <Text className="text-sm">
          Vehículos activos: {vehicles.length}
        </Text>
        <Text className="text-sm text-muted-foreground">
          Viaje ID: {travelId}
        </Text>
      </View> */}

      {/* Controles */}
      <View className="absolute bottom-20 left-4 right-4">
        <View className="bg-white p-4 rounded-lg shadow-md">
          <Text className="font-bold mb-2 text-center">Control de Transmisión</Text>
          
          {!isTracking ? (
            <Button onPress={startLocationTracking} className="mb-2">
              <Text>🚀 Iniciar Transmisión</Text>
            </Button>
          ) : (
            <Button onPress={stopLocationTracking} variant="destructive" className="mb-2">
              <Text>⏹️ Detener Transmisión</Text>
            </Button>
          )}
          
          <Button 
            onPress={() => setTravelId(prev => prev + 1)} 
            variant="outline"
          >
            <Text>🔄 Cambiar Viaje (ID: {travelId + 1})</Text>
          </Button>
        </View>
      </View>

      {/* Leyenda */}
      <View className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md">
        <Text className="font-bold mb-2 text-foreground">Leyenda</Text>
        <View className="flex-row items-center mb-1">
          <View className="w-3 h-3 rounded-full bg-orange-500 mr-2" />
          <Text className="text-foreground text-xs">En servicio</Text>
        </View>
        <View className="flex-row items-center mb-1">
          <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
          <Text className="text-foreground text-xs">Disponible</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
          <Text className="text-foreground text-xs">Mi ubicación</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RealTimeMap;