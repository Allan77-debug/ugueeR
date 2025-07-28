import { View, Text, Alert } from "react-native";
import { TravelFeedProps, UserData } from "../interfaces/interfaces";
import TripCard from "./TripCard";
import MyRoutesScreen from "../driver/MyRoutes";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/ctx";
import axios from "axios";

const TravelFeed: React.FC<TravelFeedProps> = ({
  travels,
  onReserve,
  reservingTravel,
  isDriverView,
}) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { session } = useSession();

 useEffect(() => {
    // Lógica para obtener datos del usuario y viajes (similar a tu código web)
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulación de llamadas a la API
        const { data: userRes } = await axios.get<UserData>(
          `http://192.168.56.1:8000/api/users/profile/${session?.uid}`,
          {
            headers: {
              Authorization: `Bearer ${session?.token}`,
            },
          }
        );
        setUserData(userRes);

      } catch (error) {
        Alert.alert("Error", "No se pudieron cargar los datos.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (session) {
      fetchData();
    }
  }, [session]);

  console.log("TravelFeed isDriverView:", isDriverView);

  if(isDriverView) return(
    <MyRoutesScreen userData={userData} />
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
