import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Alert, Platform, Modal, TouchableOpacity } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import { Button } from "@/components/ui/button";
import * as Location from "expo-location";
import { useSession } from "@/hooks/ctx";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

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
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const { travel_id } = useLocalSearchParams();

  // WebSockets separados
  const [driverSocket, setDriverSocket] = useState<WebSocket | null>(null);
  const [institutionSocket, setInstitutionSocket] = useState<WebSocket | null>(
    null
  );

  // Estados del conductor
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");
  const [travelStatus, setTravelStatus] = useState<
    "not_started" | "starting" | "in_progress" | "completed" | "error"
  >("not_started");
  const [isTracking, setIsTracking] = useState(false);

  // Estado para el modal de completar viaje
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isCompletingTravel, setIsCompletingTravel] = useState(false);

  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  );

  // Inicializar automáticamente cuando el componente se monta
  useEffect(() => {
    initializeServices();
    return () => cleanup();
  }, []);

  useEffect(() => {
    if (travelStatus === "in_progress") {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
  }, [travelStatus]);

  const initializeServices = async () => {
    await requestLocationPermission();
    connectDriverWebSocket(); // Conectar al WebSocket del conductor

    console.log('travel_id:', travel_id);

    if (Platform.OS === "android") {
      // Android requiere permisos de ubicación en tiempo de ejecución
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          "Permiso Denegado",
          "La aplicación necesita acceso a la ubicación para funcionar correctamente."
        );
      }
    }
    if (session?.token) {
      console.log("Sesión activa, ID de viaje:", travel_id);
    } else {
      console.error("No se encontró token de sesión");
    }
    connectToInstitutionMap(); // Para ver otros vehículos

    await startTravel();

    console.log("Servicios inicializados");
  };

  // Solicitar permisos de ubicación
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Error",
          "Se necesitan permisos de ubicación para esta funcionalidad"
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error solicitando permisos:", error);
      return false;
    }
  };

  // PASO 1: Conectar al WebSocket del conductor
  const connectDriverWebSocket = () => {
    if (!session?.token) {
      Alert.alert("Error", "No se encontró token de sesión");
      return;
    }

    if (driverSocket) {
      driverSocket.close();
    }

    const websocketUrl = `ws://192.168.56.1:8000/ws/travel/${travel_id}/?token=${session.token}`;
    console.log("🚗 Conectando WebSocket del conductor:", websocketUrl);

    setConnectionStatus("connecting");
    const newSocket = new WebSocket(websocketUrl);

    newSocket.onopen = () => {
      console.log("✅ WebSocket del conductor conectado al viaje:", travel_id);
      setConnectionStatus("connected");
    };

    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          console.error("Error desde el servidor del conductor:", data.error);
          return;
        }
        console.log("📍 Eco del servidor (conductor):", data);
      } catch (error) {
        console.error(
          "Error procesando mensaje del WebSocket del conductor:",
          error
        );
      }
    };

    newSocket.onclose = () => {
      console.log("❌ WebSocket del conductor desconectado");
      setConnectionStatus("disconnected");
      stopLocationTracking(); // Detener tracking si se desconecta
    };

    newSocket.onerror = (error) => {
      console.error("🔥 Error en la conexión WebSocket del conductor:", error);
      setConnectionStatus("error");
    };

    setDriverSocket(newSocket);
  };

  // PASO 2: Iniciar el viaje en el servidor
  const startTravel = async () => {
    if (!session?.token) {
      Alert.alert("Error", "No se encontró token de sesión");
      return;
    }

    setTravelStatus("starting");
    console.log("🚀 Iniciando viaje en el servidor...");

    try {
      const response = await fetch(
        `http://192.168.56.1:8000/api/driver/travel/${travel_id}/start/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("✅ Viaje iniciado en el servidor:", result.success);
        setTravelStatus("in_progress");
        Alert.alert("Éxito", "Viaje iniciado correctamente");
      } else {
        console.error("Error al iniciar viaje:", result.error);
        setTravelStatus("error");
        Alert.alert("Error", `No se pudo iniciar el viaje: ${result.error}`);
      }
    } catch (error) {
      console.error("Error de red al iniciar viaje:", error);
      setTravelStatus("error");
      Alert.alert("Error", "Error de conexión al iniciar el viaje");
    }
  };

  // PASO 3: Iniciar seguimiento de ubicación
  const startLocationTracking = async () => {
    if (travelStatus !== "in_progress") {
      Alert.alert("Error", "Debes iniciar el viaje primero");
      return;
    }

    try {
      console.log("📍 Iniciando seguimiento de ubicación...");

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000, // Cada 3 segundos
          distanceInterval: 5, // Cada 5 metros
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          const speed = location.coords.speed || 0;

          // Actualizar ubicación del usuario
          setUserLocation({ latitude, longitude });

          // Centrar el mapa en mi ubicación
          if (mapRef.current) {
            mapRef.current.animateToRegion(
              {
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              },
              1000
            );
          }

          // Enviar ubicación por WebSocket si está conectado
          if (driverSocket && driverSocket.readyState === WebSocket.OPEN) {
            const locationData = {
              lat: latitude,
              lon: longitude,
              speed: speed * 3.6, // Convertir m/s a km/h
            };

            driverSocket.send(JSON.stringify(locationData));
            console.log("➡️ Ubicación enviada:", locationData);
          }
        }
      );

      locationSubscription.current = subscription;
      setIsTracking(true);
      console.log("📍 Seguimiento de ubicación iniciado");
    } catch (error) {
      console.error("Error iniciando seguimiento:", error);
      Alert.alert("Error", "No se pudo iniciar el seguimiento de ubicación");
    }
  };

  // Detener seguimiento
  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    setIsTracking(false);
    console.log("🛑 Seguimiento de ubicación detenido");
  };

  // Función para completar el viaje
  const completeTravel = async () => {
    if (!session?.token) {
      Alert.alert("Error", "No se encontró token de sesión");
      return;
    }

    setIsCompletingTravel(true);
    console.log("🏁 Completando viaje en el servidor...");

    try {
      const response = await fetch(
        `http://192.168.56.1:8000/api/driver/travel/${travel_id}/complete/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("✅ Viaje completado en el servidor:", result.message);
        setTravelStatus("completed");
        setShowCompleteModal(false);
        
        // Detener todo el seguimiento
        stopLocationTracking();
        cleanup();

        Alert.alert(
          "¡Viaje Completado!",
          "El viaje ha sido marcado como completado exitosamente.",
          [
            {
              text: "Volver al Dashboard",
              onPress: () => router.replace("/driver/MyTrips"),
            },
          ]
        );
      } else {
        console.error("Error al completar viaje:", result.error);
        Alert.alert("Error", `No se pudo completar el viaje: ${result.error}`);
      }
    } catch (error) {
      console.error("Error de red al completar viaje:", error);
      Alert.alert("Error", "Error de conexión al completar el viaje");
    } finally {
      setIsCompletingTravel(false);
    }
  };

  // WebSocket para recibir ubicaciones de otros vehículos
  const connectToInstitutionMap = () => {
    if (!session?.token) {
      console.error(
        "No se encontró token de sesión para el mapa institucional"
      );
      return;
    }

    if (institutionSocket) {
      institutionSocket.close();
    }

    const websocketUrl = `ws://192.168.56.1:8000/ws/institution/live_map/?token=${session.token}`;
    console.log("🗺️ Conectando al WebSocket institucional:", websocketUrl);

    const newSocket = new WebSocket(websocketUrl);

    newSocket.onopen = () => {
      console.log(
        "✅ WebSocket institucional conectado - Escuchando vehículos"
      );
    };

    newSocket.onmessage = (event) => {
      try {
        const data: WebSocketLocationData = JSON.parse(event.data);

        if ((data as any).error) {
          console.error("Error desde el servidor:", (data as any).error);
          return;
        }

        const { travel_id: msgTravelId, driver_name, lat, lon, speed } = data;

        // No mostrar mi propio vehículo en la lista de otros
        if (msgTravelId === parseInt(travel_id as string)) return;

        console.log(
          `📍 Viaje ${msgTravelId} (${driver_name}) -> Lat: ${lat}, Lon: ${lon}`
        );

        // Actualizar o agregar vehículo
        setVehicles((prevVehicles) => {
          const existingVehicleIndex = prevVehicles.findIndex(
            (v) => v.travel_id === msgTravelId
          );

          if (existingVehicleIndex !== -1) {
            const updatedVehicles = [...prevVehicles];
            updatedVehicles[existingVehicleIndex] = {
              ...updatedVehicles[existingVehicleIndex],
              position: { latitude: lat, longitude: lon },
              driver: driver_name,
              speed,
              lastUpdate: new Date(),
              estimatedTime: "En tiempo real",
            };
            return updatedVehicles;
          } else {
            const newVehicle: Vehicle = {
              id: msgTravelId,
              travel_id: msgTravelId,
              position: { latitude: lat, longitude: lon },
              driver: driver_name,
              plate: `VEH-${msgTravelId}`,
              available: false,
              vehicleType: "En servicio",
              destination: "En ruta",
              rating: 4.5,
              estimatedTime: "En tiempo real",
              speed,
              lastUpdate: new Date(),
            };
            return [...prevVehicles, newVehicle];
          }
        });
      } catch (error) {
        console.error(
          "Error procesando mensaje del WebSocket institucional:",
          error
        );
      }
    };

    newSocket.onclose = (event) => {
      const reason = event.reason ? `, Razón: ${event.reason}` : "";
      console.log(
        `❌ WebSocket institucional desconectado. Código: ${event.code}${reason}`
      );

      setTimeout(() => {
        console.log("🔄 Intentando reconectar al mapa institucional...");
        connectToInstitutionMap();
      }, 5000);
    };

    newSocket.onerror = (error) => {
      console.error("🔥 Error en la conexión WebSocket institucional:", error);
    };

    setInstitutionSocket(newSocket);
  };

  // Cleanup
  const cleanup = () => {
    stopLocationTracking();

    if (driverSocket) {
      driverSocket.close();
      setDriverSocket(null);
    }

    if (institutionSocket) {
      institutionSocket.close();
      setInstitutionSocket(null);
    }

    setConnectionStatus("disconnected");
  };

  // Limpiar vehículos que no han enviado datos recientemente
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = new Date();
      setVehicles((prev) =>
        prev.filter((vehicle) => {
          const timeDiff = now.getTime() - vehicle.lastUpdate.getTime();
          return timeDiff < 60000;
        })
      );
    }, 30000);

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
        {/* Marcadores de otros vehículos */}
        {vehicles.map((vehicle) => (
          <Marker
            key={`vehicle-${vehicle.travel_id}`}
            coordinate={vehicle.position}
            pinColor="orange"
            title={`${vehicle.driver} - Viaje ${vehicle.travel_id}`}
            description={`${vehicle.vehicleType} | ${vehicle.speed ? `${vehicle.speed.toFixed(1)} km/h` : "Sin velocidad"}`}
          />
        ))}

        {/* Mi ubicación como conductor */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title={`Mi vehículo - Viaje ${travel_id}`}
            description="Conductor activo"
            pinColor="blue"
          />
        )}
      </MapView>

      {/* Panel de estado del conductor */}
      <View className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md">
        <Text className="font-bold mb-1 text-foreground">Estado del Viaje</Text>
        <Text className="text-sm">
          Estado: {travelStatus === 'in_progress' ? '🟢 En progreso' :
                   travelStatus === 'starting' ? '🟡 Iniciando...' :
                   travelStatus === 'completed' ? '✅ Completado' :
                   travelStatus === 'error' ? '🔴 Error' : '⚫ No iniciado'}
        </Text>
        <Text className="text-sm">
          Ubicación: {isTracking ? '🟢 Transmitiendo' : '🔴 Detenida'}
        </Text>
        <Text className="text-sm text-muted-foreground">
          Viaje ID: {travel_id}
        </Text>
      </View>

      {/* Botón flotante para completar viaje */}
      {travelStatus === "in_progress" && (
        <View className="absolute bottom-20 left-4 right-4">
          <TouchableOpacity
            onPress={() => setShowCompleteModal(true)}
            className="bg-green-600 p-4 rounded-lg shadow-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-center text-lg">
              🏁 Completar Viaje
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal para confirmar completar viaje */}
      <Modal
        visible={showCompleteModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !isCompletingTravel && setShowCompleteModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 shadow-lg">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
            
            <Text className="text-2xl font-bold text-center mb-2">
              🏁 Completar Viaje
            </Text>
            
            <Text className="text-gray-600 text-center mb-6">
              ¿Estás seguro de que quieres marcar este viaje como completado?
            </Text>

            <View className="bg-gray-50 p-4 rounded-lg mb-6">
              <Text className="text-sm text-gray-600 mb-1">Viaje ID:</Text>
              <Text className="font-semibold text-lg">#{travel_id}</Text>
              
              <Text className="text-sm text-gray-600 mb-1 mt-3">Estado actual:</Text>
              <Text className="font-semibold text-green-600">En progreso</Text>
            </View>

            <Text className="text-sm text-gray-500 text-center mb-6">
              Al completar el viaje, se detendrá el seguimiento de ubicación y se notificará a los pasajeros.
            </Text>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowCompleteModal(false)}
                disabled={isCompletingTravel}
                className="flex-1 bg-gray-200 p-4 rounded-lg"
              >
                <Text className="text-gray-700 font-semibold text-center">
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={completeTravel}
                disabled={isCompletingTravel}
                className={`flex-1 p-4 rounded-lg ${
                  isCompletingTravel ? 'bg-gray-400' : 'bg-green-600'
                }`}
              >
                <Text className="text-white font-semibold text-center">
                  {isCompletingTravel ? 'Completando...' : 'Completar Viaje'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Leyenda */}
      <View className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md">
        <Text className="font-bold mb-2 text-foreground">Leyenda</Text>
        <View className="flex-row items-center mb-1">
          <View className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
          <Text className="text-foreground text-xs">Mi vehículo</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-orange-500 mr-2" />
          <Text className="text-foreground text-xs">Otros conductores</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RealTimeMap;
