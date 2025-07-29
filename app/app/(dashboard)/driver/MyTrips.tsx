import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useSession } from '@/hooks/ctx';
import axios from 'axios';
import { Plus } from 'lucide-react-native';
import TripCardDriver from '../atoms/TripCardDriver';
import TripForm from '../molecules/TripForm';
import {
  DriverTrip,
  DriverRoute,
  AddTripPayload,
  TripFormData,
  Vehicle,
  Travel
} from '../interfaces/interfaces';
import Icon from '../atoms/icon';

const MyTripsScreen = () => {
  const { session } = useSession();
  const [trips, setTrips] = useState<Travel[]>([]);
  const [availableRoutes, setAvailableRoutes] = useState<DriverRoute[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadingFormData, setLoadingFormData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPageData = useCallback(async () => {
    setIsLoading(true);
    setLoadingFormData(true);
    setError(null);

    try {
      const [tripsResponse] = await Promise.all([
        axios.get<Travel[]>(`http://192.168.56.1:8000/api/travel/info/${session?.uid}`, {
          headers: { Authorization: `Bearer ${session?.token}` }
        }),
      ]);

      const tripsData = tripsResponse.data;

      setTrips(tripsData);
    } catch (err) {
      console.error("Error fetching page data:", err);
      setError("No se pudieron cargar los datos. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
      setLoadingFormData(false);
    }
  }, [session?.token]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPageData().finally(() => setRefreshing(false));
  }, [fetchPageData]);

  const handleAddTrip = async (formData: TripFormData) => {
    setIsSubmitting(true);
    setError(null);

    const tripPayload: AddTripPayload = {
      driver: session?.uid || 0,
      route: formData.selectedRouteId,
      vehicle: formData.selectedVehicleId,
      price: formData.price,
      time: new Date(formData.departureDateTime).toISOString(),
      travel_state: "scheduled",
    };

    try {
      await axios.post(
        `http://192.168.56.1:8000/api/driver/trips/`,
        tripPayload,
        {
          headers: { Authorization: `Bearer ${session?.token}` }
        }
      );
      
      setShowAddModal(false);
      await fetchPageData();
      Alert.alert('Éxito', 'Viaje publicado exitosamente');
    } catch (error: any) {
      console.error("Error adding trip:", error);
      Alert.alert('Error', 'No se pudo publicar el viaje. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrip = async (tripId: number) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este viaje?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(
                `http://192.168.56.1:8000/api/travel/travel/${tripId}/`,
                {
                  headers: { Authorization: `Bearer ${session?.token}` }
                }
              );
              setTrips(prev => prev.filter(t => t.id !== tripId));
              Alert.alert('Éxito', 'Viaje eliminado exitosamente');
            } catch (error) {
              console.error("Error deleting trip:", error);
              Alert.alert('Error', 'No se pudo eliminar el viaje');
            }
          }
        }
      ]
    );
  };

  const canAddTrip = availableRoutes.length > 0 && availableVehicles.length > 0;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="mt-4 text-gray-600">Cargando viajes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <FlatList
        data={trips}
        renderItem={({ item }) => (
          <TripCardDriver
            trip={item}
            onDelete={handleDeleteTrip}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-gray-800">Mis Viajes</Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              disabled={loadingFormData || !canAddTrip}
              className={`p-3 rounded-lg ${
                loadingFormData || !canAddTrip ? 'bg-gray-400' : 'bg-primary'
              }`}
            >
              <Icon icon={Plus} size={24} color="white" />
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-12">
            {!canAddTrip ? (
              <View className="items-center">
                <Text className="text-gray-600 text-center mb-4">
                  Para publicar un viaje, primero necesitas:
                </Text>
                {availableRoutes.length === 0 && (
                  <Text className="text-gray-600 text-center">
                    • Definir al menos una ruta
                  </Text>
                )}
                {availableVehicles.length === 0 && (
                  <Text className="text-gray-600 text-center">
                    • Registrar al menos un vehículo
                  </Text>
                )}
              </View>
            ) : (
              <View className="items-center">
                <Text className="text-gray-600 text-center mb-4">
                  Aún no has publicado ningún viaje
                </Text>
                <TouchableOpacity
                  onPress={() => setShowAddModal(true)}
                  className="bg-primary px-6 py-3 rounded-lg flex-row items-center"
                >
                  <Icon icon={Plus} size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Publicar Mi Primer Viaje
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4f46e5"]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <Modal
        animationType="slide"
        transparent={false}
        visible={showAddModal}
        onRequestClose={() => !isSubmitting && setShowAddModal(false)}
      >
        <SafeAreaView className="flex-1 bg-gray-100">
          {loadingFormData ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text className="mt-4 text-gray-600">Cargando formulario...</Text>
            </View>
          ) : !canAddTrip ? (
            <View className="flex-1 justify-center items-center p-4">
              <Text className="text-center text-gray-600">
                Por favor, registra rutas y vehículos antes de publicar un viaje.
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                className="mt-4 bg-gray-300 px-6 py-3 rounded-lg"
              >
                <Text className="text-gray-700 font-semibold">Cerrar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TripForm
              onSubmit={handleAddTrip}
              onCancel={() => setShowAddModal(false)}
              isSubmitting={isSubmitting}
              availableRoutes={availableRoutes}
              availableVehicles={availableVehicles}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default MyTripsScreen;