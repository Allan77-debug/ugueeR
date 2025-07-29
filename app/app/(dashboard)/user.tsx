import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
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

const UserDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [travels, setTravels] = useState<Travel[]>([]);
  const [reservedTravels, setReservedTravels] = useState<
    { id: number; uid: number; status: string }[]
  >([]);
  const [reservingTravel, setReservingTravel] = useState<number | null>(null);
  const { session, signOut } = useSession();

  useEffect(() => {
    // Lógica para obtener datos del usuario y viajes (similar a tu código web)
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: travelsRes } = await axios.get<Travel[]>(
          "http://192.168.56.1:8000/api/travel/institution/",
          {
            headers: {
              Authorization: `Bearer ${session?.token}`,
            },
          }
        );
        console.log("Viajes obtenidos:", travelsRes);
        setTravels(travelsRes);

        const { data: travelsReserved } = await axios.get<
          {
            id: number;
            uid: number;
            status: string;
          }[]
        >("http://192.168.56.1:8000/api/realize/my-reservations/", {
          headers: {
            Authorization: `Bearer ${session?.token}`,
          },
        });
        setReservedTravels(travelsReserved);
      } catch (error) {
        signOut();
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchData();
  }, [session]);

  const handleReserveTravel = async (travelId: number) => {
    setReservingTravel(travelId);
    try {
      // Simulación de reserva
      await axios.post(
        `http://192.168.56.1:8000/api/realize/create/`,
        {
          id_travel: travelId,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.token}`,
          },
        }
      );
      Burnt.alert({
        title: "¡Éxito!",
        preset: "done",
        message: "Tu viaje ha sido reservado.",
      });

      // Actualizar UI
      // setTravels((prev) =>
      //   prev.map((t) => (t.id_travel === travelId ? { ...t, availableSeats: t.availableSeats - 1 } : t))
      // )
    } catch (error) {
      Burnt.alert({
        title: "Error",
        preset: "error",
        message: "No se pudo completar la reserva.",
      });
    } finally {
      setReservingTravel(null);
    }
  };

  const handleDriverApplication = () => {
    Alert.alert(
      "¿Quieres ser conductor?",
      "Se te redirigirá a la pantalla de solicitud.",
      [
        { text: "Cancelar" },
        // { text: "Aceptar", onPress: () => router.push("/solicitud-conductor") }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: () => {
          // Lógica de logout (limpiar AsyncStorage, etc.)
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
    <TravelFeed
      travels={travels}
      onReserve={handleReserveTravel}
      reservingTravel={reservingTravel}
    />
  );
};

export default UserDashboard;
