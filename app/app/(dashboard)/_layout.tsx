import React, { useState, useEffect } from "react";
import { Route, Slot, usePathname, useRouter } from "expo-router";
import {
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import { UserData, Travel } from "./interfaces/interfaces";
import TravelFeed from "./molecules/TravelFeed";
import ProfileHeader from "./organism/ProfileHeader";
import QuickActions from "./molecules/QuickActions";
import * as Burnt from "burnt";
import { useSession } from "@/hooks/ctx";
import QuickActionsDriver from "./molecules/QuickActionsDriver";

const UserDashboard = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { session, signOut } = useSession();
  const pathname = usePathname();

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

  const handleDriverApplication = () => {
    Alert.alert(
      "¿Quieres ser conductor?",
      "Para ser conductor, debes completar tu perfil y enviar una solicitud.",
      [
        { text: "Cancelar" },
        {
          text: "Aceptar",
          onPress: async () => {
            const response = await axios.post(
              `http://192.168.56.1:8000/api/users/apply-driver/${session?.uid}/`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${session?.token}`,
                },
              }
            );
            if (response.status === 200) {
              Burnt.toast({
                title: "Solicitud Enviada",
                preset: "done",
                message: "Tu solicitud para ser conductor ha sido enviada.",
              });
              router.push("/driver/MyRoutes");
            } else {
              Burnt.alert({
                title: "Error",
                preset: "error",
                message: "No se pudo enviar la solicitud.",
              });
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    signOut();
    router.replace("/");
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: () => {
          signOut();
          router.replace("/");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="mt-4 text-gray-600">Cargando tu información...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ProfileHeader userData={userData} onLogout={handleLogout} pathname={pathname} />
      {pathname.includes("driver") ? (
        <QuickActionsDriver
          driverState={userData?.driver_state}
          onNavigate={(path) => router.push(path)}
          onApply={handleDriverApplication}
        />
      ) : (
        <QuickActions
          driverState={userData?.driver_state}
          onNavigate={(path) => router.push(path)}
          onApply={handleDriverApplication}
        />
      )}

      <Slot />
    </SafeAreaView>
  );
};

export default UserDashboard;
