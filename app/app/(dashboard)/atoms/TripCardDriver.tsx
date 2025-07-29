import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { MapPin, Clock, Car, Users, Trash2 } from "lucide-react-native";
import Icon from "./icon";
import { Travel } from "../interfaces/interfaces";
import QRCode from "react-native-qrcode-svg";
import { useRouter } from "expo-router";

interface TripCardDriverProps {
  trip: Travel;
  onDelete: (tripId: number) => void;
}

const TripCardDriver: React.FC<TripCardDriverProps> = ({ trip, onDelete }) => {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const router = useRouter();

  const formatDate = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStateText = (state: string) => {
    switch (state) {
      case "scheduled":
        return "Programado";
      case "in_progress":
        return "En Progreso";
      case "completed":
        return "Completado";
      case "cancelled":
        return "Cancelado";
      default:
        return state;
    }
  };

  console.log(trip);

  return (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-4 shadow-md border border-gray-200"
      onPress={() => setShowAddModal(true)}
    >
      {/* Header with route */}
      <View className="flex-row items-center mb-3">
        <Icon icon={MapPin} size={18} color="#4f46e5" />
        <Text className="ml-2 font-bold text-lg flex-1" numberOfLines={2}>
          {trip.route?.startLocation} → {trip.route?.destination}
        </Text>
      </View>

      {/* Trip details */}
      <View className="space-y-2 mb-3">
        <View className="flex-row items-center">
          <Icon icon={Clock} size={16} color="#6b7280" />
          <Text className="ml-2 text-gray-700">
            {formatDate(trip.time)}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Icon icon={Car} size={16} color="#6b7280" />
          <Text className="ml-2 text-gray-700">{trip.vehicle?.vehicle_type}</Text>
        </View>

        <View className="flex-row items-center">
          <Icon icon={Users} size={16} color="#6b7280" />
          <Text className="ml-2 text-gray-700">
            {trip.available_seats} asientos disponibles
          </Text>
        </View>
      </View>

      {/* Footer with price, state and actions */}
      <View className="flex-row justify-between items-center pt-3 border-t border-gray-200">
        <View className="flex-row items-center space-x-2">
          <Text className="font-bold text-lg text-green-600">
            ${trip.price.toLocaleString()}
          </Text>
          <View
            className={`px-2 py-1 rounded-full ${getStateColor(trip.travel_state)}`}
          >
            <Text className="text-xs font-medium">
              {getStateText(trip.travel_state )}
            </Text>
          </View>
        </View>

        {trip.travel_state === "scheduled" && (
          <TouchableOpacity
            onPress={() => onDelete(trip.id)}
            className="p-2 bg-red-50 rounded-lg"
          >
            <Icon icon={Trash2} size={18} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
      <Modal
        animationType="slide"
        transparent={false}
        visible={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView className="flex flex-col items-center bg-white">
          <ScrollView className="p-4">
            <View className="flex flex-col items-center mb-4">
              <Text className="text-xl font-bold mb-2">Detalles del Viaje</Text>
              <Text className="text-gray-700 mb-1">
                {trip.route?.startLocation} → {trip.route?.destination}
              </Text>
              <Text className="text-gray-500">
                {formatDate(trip.time)}
              </Text>
              <QRCode
                value={`http://192.168.56.1:8000/realize/confirm/${trip.reservations?.[0]?.id}`}
                size={300}
              />

              <TouchableOpacity
                className="mt-4 bg-primary rounded-lg px-5 py-2"
                onPress={() => setShowAddModal(false)}
              >
                <Text className="text-white font-semibold">Cerrar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mt-4 bg-primary rounded-lg px-5 py-2"
                onPress={() =>
                  router.push(`/driver/maps/${trip.id}` as any)
                }
              >
                <Text className="text-white font-semibold">Ir al Viaje</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </TouchableOpacity>
  );
};

export default TripCardDriver;
