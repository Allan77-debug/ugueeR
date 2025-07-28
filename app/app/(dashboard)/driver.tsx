import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
    ScrollView,
} from "react-native";
import { Travel } from "./interfaces/interfaces";
import TravelFeed from "./molecules/TravelFeed";
import * as Burnt from "burnt";

const DriverDashboard = () => {
  const router = useRouter();
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
