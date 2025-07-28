import { View, Text } from "react-native";
import { TravelFeedProps } from "../interfaces/interfaces";
import TripCard from "./TripCard";
import MyRoutesScreen from "../driver/MyRoutes";

const TravelFeed: React.FC<TravelFeedProps> = ({
  travels,
  onReserve,
  reservingTravel,
  isDriverView,
}) => {
  if(isDriverView) return(
    <MyRoutesScreen />
  )
  return (
    <View className="p-6">
      <Text className="text-xl font-bold text-gray-800 mb-4">
        Viajes Disponibles
      </Text>
      {travels.length > 0 ? (
        travels.map((travel) => (
          <TripCard
            key={travel.id}
            travel={travel}
            onReserve={onReserve}
            isReserving={reservingTravel === travel.id}
          />
        ))
      ) : (
        <Text className="text-center text-gray-500 mt-8">
          No hay viajes disponibles por ahora.
        </Text>
      )}
    </View>
  );
};

export default TravelFeed;
