import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { DriverRoute, Vehicle, TripFormData } from '../interfaces/interfaces';

interface TripFormProps {
  onSubmit: (data: TripFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  availableRoutes: DriverRoute[];
  availableVehicles: Vehicle[];
}

const TripForm: React.FC<TripFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
  availableRoutes,
  availableVehicles
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<number>(0);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number>(0);
  const [price, setPrice] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');

  const handleSubmit = () => {
    // Validaciones
    if (!selectedRouteId) {
      Alert.alert('Error', 'Selecciona una ruta');
      return;
    }
    if (!selectedVehicleId) {
      Alert.alert('Error', 'Selecciona un vehículo');
      return;
    }
    if (!price || isNaN(Number(price))) {
      Alert.alert('Error', 'Ingresa un precio válido');
      return;
    }
    if (!date) {
      Alert.alert('Error', 'Ingresa una fecha');
      return;
    }
    if (!time) {
      Alert.alert('Error', 'Ingresa una hora');
      return;
    }

    // Combinar fecha y hora
    const departureDateTime = `${date}T${time}:00`;

    const formData: TripFormData = {
      selectedRouteId,
      selectedVehicleId,
      price: Number(price),
      departureDateTime
    };

    onSubmit(formData);
  };

  return (
    <ScrollView className="p-4">
      <Text className="text-lg font-bold mb-4">Publicar Nuevo Viaje</Text>

      {/* Selección de ruta */}
      <View className="mb-4">
        <Text className="text-base font-semibold mb-2">Ruta *</Text>
        <View className="bg-white border border-gray-300 rounded-lg">
          <Picker
            selectedValue={selectedRouteId}
            onValueChange={setSelectedRouteId}
          >
            <Picker.Item label="Selecciona una ruta" value={0} />
            {availableRoutes.map((route) => (
              <Picker.Item
                key={route.id}
                label={`${route.startLocation} → ${route.destination}`}
                value={route.id}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Selección de vehículo */}
      <View className="mb-4">
        <Text className="text-base font-semibold mb-2">Vehículo *</Text>
        <View className="bg-white border border-gray-300 rounded-lg">
          <Picker
            selectedValue={selectedVehicleId}
            onValueChange={setSelectedVehicleId}
          >
            <Picker.Item label="Selecciona un vehículo" value={0} />
            {availableVehicles.map((vehicle) => (
              <Picker.Item
                key={vehicle.id}
                label={`${vehicle.brand} - ${vehicle.category} (${vehicle.capacity} asientos)`}
                value={vehicle.id}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Precio */}
      <View className="mb-4">
        <Text className="text-base font-semibold mb-2">Precio (COP) *</Text>
        <TextInput
          className="bg-white border border-gray-300 rounded-lg p-3"
          value={price}
          onChangeText={setPrice}
          placeholder="Ej: 15000"
          keyboardType="numeric"
        />
      </View>

      {/* Fecha */}
      <View className="mb-4">
        <Text className="text-base font-semibold mb-2">Fecha (YYYY-MM-DD) *</Text>
        <TextInput
          className="bg-white border border-gray-300 rounded-lg p-3"
          value={date}
          onChangeText={setDate}
          placeholder="2024-12-25"
        />
      </View>

      {/* Hora */}
      <View className="mb-6">
        <Text className="text-base font-semibold mb-2">Hora (HH:MM) *</Text>
        <TextInput
          className="bg-white border border-gray-300 rounded-lg p-3"
          value={time}
          onChangeText={setTime}
          placeholder="14:30"
        />
      </View>

      {/* Botones */}
      <View className="flex-row space-x-3">
        <TouchableOpacity
          onPress={onCancel}
          disabled={isSubmitting}
          className="flex-1 bg-gray-200 rounded-lg p-3"
        >
          <Text className="text-center font-semibold text-gray-700">Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`flex-1 rounded-lg p-3 ${isSubmitting ? 'bg-gray-400' : 'bg-primary'}`}
        >
          <Text className="text-center font-semibold text-white">
            {isSubmitting ? 'Publicando...' : 'Publicar Viaje'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default TripForm;