import { MapPin, User, Star, Clock, Car } from "lucide-react-native";
import { View, Text, Modal, Alert, SafeAreaView } from "react-native";
import ButtonTouchable from "../atoms/ButtomTouchable";
import { TripCardProps } from "../interfaces/interfaces";
import Icon from "../atoms/icon";
import AssessmentForm, { AssessmentFormData } from "./AssestmentForm";
import { useState } from "react";
import axios from "axios";

const TripCard: React.FC<TripCardProps> = ({
  travel,
  onReserve,
  isReserving,
  isReserved,
  session
}) => {
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);

  const handleAssessmentSubmit = async (data: AssessmentFormData) => {
    setIsSubmittingAssessment(true);

    try {
      const response = await axios.post(
        "http://192.168.56.1:8000/api/assessment/assessment/create/",
        data,
        {
          headers: {
            Authorization: `Bearer ${session?.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert("Éxito", "Calificación enviada correctamente");
      setShowAssessmentModal(false);
    } catch (error: any) {
      console.error("Error creating assessment:", error);
      const errorMessage =
        error.response?.data?.error || "No se pudo enviar la calificación";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmittingAssessment(false);
    }
  };

  return (
    <View className="bg-white rounded-lg shadow-md p-4 mx-2 mb-4">
      <View className="flex-row justify-between items-center">
        <View className="flex-1 flex-row items-center mr-2">
          <Icon icon={MapPin} color="#4f46e5" />
          <Text
            className="font-bold text-lg ml-2 flex-1"
            ellipsizeMode="tail"
            numberOfLines={2}
          >
            {travel.route?.startLocation} → {travel.route?.destination}
          </Text>
        </View>
      </View>
      <Text className="font-bold text-xl text-primary">
        ${travel.price.toLocaleString()}
      </Text>

      <View className="mt-4 border-t border-gray-100 pt-4">
        <View className="flex-row justify-between mb-2">
          <View className="flex-row items-center">
            <Icon icon={User} size={16} color="gray" />
            <Text className="ml-2 text-gray-700">
              {travel.driver?.user.full_name}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Icon icon={Star} size={16} color="gold" />
            <Text className="ml-1 text-gray-700">{travel?.driver_score}</Text>
          </View>
        </View>

        <View className="flex-row justify-between">
          <View className="flex-row items-center">
            <Icon icon={Clock} size={16} color="gray" />
            <Text className="ml-2 text-gray-700">{travel.time}</Text>
          </View>
          <View className="flex-row items-center">
            <Icon icon={Car} size={16} color="gray" />
            <Text className="ml-2 text-gray-700">
              {travel.vehicle?.vehicle_type}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row justify-between items-center mt-4">
        <Text className="text-green-600 font-semibold">
          {travel.vehicle.capacity} asientos disponibles
        </Text>

        {/* Renderizado condicional de los botones */}
        {travel.travel_state !== "completed" && (
          <>
            {travel?.reservations?.some(
              (reservation) => reservation.user.uid === travel.driver?.user.uid
            ) ? (
              <ButtonTouchable
                className={`py-2 px-4 rounded-lg bg-primary flex flex-row gap-1 justify-center items-center`}
                onPress={() => setShowAssessmentModal(true)}
              >
                <Icon icon={Star} size={16} color="white" />
                <Text className="text-white font-bold">Califica</Text>
              </ButtonTouchable>
            ) : isReserved ? (
              <ButtonTouchable
                className={`py-2 px-4 rounded-lg bg-primary`}
                onPress={() => onReserve(travel.id)}
              >
                <Text className="text-white font-bold">Ir al viaje</Text>
              </ButtonTouchable>
            ) : (
              <ButtonTouchable
                className={`py-2 px-4 rounded-lg ${
                  isReserving ||
                  !travel.vehicle.capacity ||
                  travel.vehicle.capacity <= 0
                    ? "bg-gray-400"
                    : "bg-primary"
                }`}
                onPress={() => onReserve(travel.id)}
                disabled={
                  isReserving ||
                  !travel.vehicle.capacity ||
                  travel.vehicle.capacity <= 0
                }
              >
                <Text className="text-white font-bold">
                  {isReserving ? "Reservando..." : "Reservar"}
                </Text>
              </ButtonTouchable>
            )}
          </>
        )}
      </View>

      {/* Modal de Calificación */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showAssessmentModal}
        onRequestClose={() => !isSubmittingAssessment && setShowAssessmentModal(false)}
      >
        <SafeAreaView className="flex-1 bg-gray-100">
          <AssessmentForm
            onSubmit={handleAssessmentSubmit}
            onCancel={() => setShowAssessmentModal(false)}
            isSubmitting={isSubmittingAssessment}
            travelId={travel.id}
            driverId={travel.driver?.user.full_name || ""}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default TripCard;