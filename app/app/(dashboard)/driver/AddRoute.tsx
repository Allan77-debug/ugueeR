import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Burnt from 'burnt';

const AddRouteScreen = () => {
  const router = useRouter();
  const [routeName, setRouteName] = useState('');
  const [origin, setOrigin] = useState<{ latitude: number; longitude: number; } | null>(null);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number; } | null>(null);
  const [stops, setStops] = useState<{ latitude: number; longitude: number; }[]>([]);
  const mapRef = useRef(null);

  const handleMapPress = (event: { nativeEvent: { coordinate: { latitude: number; longitude: number; }; }; }) => {
    const { coordinate } = event.nativeEvent;
    if (!origin) {
      setOrigin(coordinate);
    } else if (!destination) {
      setDestination(coordinate);
    } else {
      setStops([...stops, coordinate]);
    }
  };

  const handleSaveRoute = () => {
    if (!routeName || !origin || !destination) {
      Burnt.alert({
        title: 'Error',
        message: 'Por favor, completa el nombre, origen y destino de la ruta.',
        preset: 'error'
      });
      return;
    }
    // Lógica para guardar la ruta (simulada)
    console.log({ routeName, origin, destination, stops });
    Burnt.alert({
      title: 'Éxito',
      message: 'Ruta guardada correctamente.',
      preset: 'done'
    });
    router.back();
  };

  const handleReset = () => {
    setOrigin(null);
    setDestination(null);
    setStops([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Agregar Nueva Ruta</Text>
        <View style={{ width: 24 }} />
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 6.217,
          longitude: -75.567,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
      >
        {origin && <Marker coordinate={origin} title="Origen" pinColor="green" />}
        {destination && <Marker coordinate={destination} title="Destino" pinColor="blue" />}
        {stops.map((stop, index) => (
          <Marker key={index} coordinate={stop} title={`Parada ${index + 1}`} pinColor="orange" />
        ))}
        {origin && destination && (
          <Polyline coordinates={[origin, ...stops, destination]} strokeColor="#FF0000" strokeWidth={3} />
        )}
      </MapView>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombre de la ruta (ej. Casa - Universidad)"
          value={routeName}
          onChangeText={setRouteName}
        />
        <View style={styles.coordinatesContainer}>
            <Text style={styles.coordinatesText}>
            Origen: {origin ? `${origin.latitude.toFixed(4)}, ${origin.longitude.toFixed(4)}` : 'No seleccionado'}
            </Text>
            <Text style={styles.coordinatesText}>
            Destino: {destination ? `${destination.latitude.toFixed(4)}, ${destination.longitude.toFixed(4)}` : 'No seleccionado'}
            </Text>
        </View>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Ionicons name="refresh-outline" size={20} color="#333" />
            <Text style={styles.resetButtonText}>Reiniciar Puntos</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveRoute}>
        <Ionicons name="save-outline" size={24} color="white" />
        <Text style={styles.saveButtonText}>Guardar Ruta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  map: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  coordinatesContainer: {
    marginBottom: 12,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  resetButtonText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default AddRouteScreen;
