import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline, Callout } from "react-native-maps";
import { Button } from "@/components/ui/button";

// Interfaz para los datos del vehículo
interface Vehicle {
  id: number;
  position: { latitude: number; longitude: number };
  driver: string;
  plate: string;
  available: boolean;
  vehicleType: string;
  destination: string;
  rating: number;
  estimatedTime: string;
}

// Coordenadas iniciales del mapa (ej. Cali, Colombia)
const initialRegion = {
  latitude: 3.4516,
  longitude: -76.532,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const RealTimeMap = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showRoute, setShowRoute] = useState<boolean>(false);
  const [routePath, setRoutePath] = useState<{ latitude: number; longitude: number }[]>([]);
  const mapRef = useRef<MapView>(null);

  // Simulación de datos y movimiento de vehículos
  useEffect(() => {
    const initialVehicles: Vehicle[] = [
      { id: 1, position: { latitude: 3.4516, longitude: -76.532 }, driver: "Carlos Rodríguez", plate: "ABC123", available: true, vehicleType: "Sedan", destination: "Terminal", rating: 4.8, estimatedTime: "5 min" },
      { id: 2, position: { latitude: 3.46, longitude: -76.525 }, driver: "Ana Martínez", plate: "XYZ789", available: false, vehicleType: "SUV", destination: "Chipichape", rating: 4.5, estimatedTime: "En viaje" },
      { id: 3, position: { latitude: 3.445, longitude: -76.54 }, driver: "Luis Gómez", plate: "DEF456", available: true, vehicleType: "Hatchback", destination: "Universidades", rating: 4.9, estimatedTime: "8 min" },
    ];
    setVehicles(initialVehicles);

    const interval = setInterval(() => {
      setVehicles(prevVehicles =>
        prevVehicles.map(v => ({
          ...v,
          position: {
            latitude: v.position.latitude + (Math.random() - 0.5) * 0.001,
            longitude: v.position.longitude + (Math.random() - 0.5) * 0.001,
          },
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowRoute(false);
    setRoutePath([]);
    mapRef.current?.animateToRegion({
        ...vehicle.position,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    }, 500);
  };

  const handleShowRoute = (vehicle: Vehicle) => {
    setShowRoute(true);
    // Simulación de ruta
    const mockDestination = {
        latitude: vehicle.position.latitude + (Math.random() - 0.5) * 0.02,
        longitude: vehicle.position.longitude + (Math.random() - 0.5) * 0.02,
    };
    setRoutePath([vehicle.position, mockDestination]);
  };

  return (
    <View className="flex-1 bg-background">
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        provider="google" // Es importante especificar el proveedor
        
      >
        {vehicles.map(vehicle => (
          <Marker
            key={vehicle.id}
            coordinate={vehicle.position}
            pinColor={vehicle.available ? "green" : "red"}
            onPress={() => handleVehicleSelect(vehicle)}
          >
            <Callout tooltip>
              <View className="bg-white p-3 rounded-lg shadow-lg w-64">
                <Text className="text-lg font-bold text-foreground">{vehicle.driver}</Text>
                <Text className="text-sm text-muted-foreground">{vehicle.plate}</Text>
                <View className="border-t border-border my-2" />
                <Text className="text-foreground">Destino: {vehicle.destination}</Text>
                <Text className="text-foreground">Tipo: {vehicle.vehicleType}</Text>
                <Text className="text-foreground">Rating: {vehicle.rating} ★</Text>
                <Button className="mt-2" onPress={() => handleShowRoute(vehicle)}>
                    <Text>Ver Ruta</Text>
                </Button>
              </View>
            </Callout>
          </Marker>
        ))}

        {showRoute && routePath.length > 0 && (
            <Polyline
                coordinates={routePath}
                strokeColor="#0000FF" // Azul
                strokeWidth={3}
            />
        )}
      </MapView>

      {/* Leyenda */}
      <View className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md">
        <Text className="font-bold mb-2 text-foreground">Leyenda</Text>
        <View className="flex-row items-center mb-1">
            <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
            <Text className="text-foreground">Disponible</Text>
        </View>
        <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
            <Text className="text-foreground">No Disponible</Text>
        </View>
      </View>
    </View>
  );
};

export default RealTimeMap;
