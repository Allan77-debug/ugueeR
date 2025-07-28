import { MapPin, User, Star, Clock, Car } from "lucide-react-native";
import { View, Text } from "react-native";
import ButtonTouchable from "../atoms/ButtomTouchable";
import { TripCardProps } from "../interfaces/interfaces";
import Icon from "../atoms/icon";

const TripCard: React.FC<TripCardProps> = ({ travel, onReserve, isReserving }) => (
  <View className="bg-white rounded-lg p-4 mb-4 shadow-md">
    <View className="flex-row justify-between items-center">
      <View className="flex-1 flex-row items-center mr-2">
        <Icon icon={MapPin} color="#4f46e5" />
        <Text className="font-bold text-lg ml-2 flex-1" ellipsizeMode="tail" numberOfLines={2}>
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
          <Text className="ml-2 text-gray-700">{travel.driver?.user.full_name}</Text>
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
          <Text className="ml-2 text-gray-700">{travel.vehicle?.vehicle_type}</Text>
        </View>
      </View>
    </View>

    <View className="flex-row justify-between items-center mt-4">
      <Text className="text-green-600 font-semibold">
        {travel.vehicle.capacity} asientos disponibles
      </Text>
      <ButtonTouchable
        className={`py-2 px-4 rounded-lg ${
          isReserving || !travel.vehicle.capacity || travel.vehicle.capacity <= 0 ? "bg-gray-400" : "bg-primary"
        }`}
        onPress={() => onReserve(travel.id)}
        disabled={isReserving || !travel.vehicle.capacity || travel.vehicle.capacity <= 0}
      >
        <Text className="text-white font-bold">
          {isReserving ? "Reservando..." : "Reservar"}
        </Text>
      </ButtonTouchable>
    </View>
  </View>
)


export default TripCard;