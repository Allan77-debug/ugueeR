import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { UserData, Travel } from "./interfaces/interfaces";
import ProfileHeader from "./organism/ProfileHeader";
import QuickActions from "./molecules/QuickActions";
import TravelFeed from "./molecules/TravelFeed";
import * as Burnt from "burnt";

const DriverDashboard = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [travels, setTravels] = useState<Travel[]>([]);

 
  const handleCreateTravel = () => {
    // router.push("/(driver)/create-travel")
    Burnt.toast({
      title: "Próximamente",
      preset: "custom",
      icon: {
        ios: {
          name: "car",
          color: "#A78BFA",
        },
      },
      message: "La creación de viajes estará disponible pronto.",
    });
  };

  const handleMyRoutes = () => {
    router.push("/driver/MyRoutes");
  };

  const handleLogout = () => {
    // Aquí puedes implementar la lógica de cierre de sesión
    Burnt.toast({
      title: "Sesión cerrada",
      preset: "done",
      message: "Has cerrado sesión correctamente.",
    });
    router.push("/login");
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="mt-4 text-gray-600">
          Cargando tu perfil de conductor...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView>
      <TravelFeed
        travels={travels}
        onReserve={() => {}}
        reservingTravel={null}
        isDriverView={true}
      />
    </ScrollView>
  );
};

export default DriverDashboard;
