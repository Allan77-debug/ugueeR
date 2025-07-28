import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/hooks/ctx";
import axios from "axios";
import { UserData } from "../interfaces/interfaces";
import RouteCard from "../organism/RouteCard";

type Route = {
  id: string;
  name: string;
  startPointCoords: number[];
  endPointCoords: number[];
  stops: { latitude: number; longitude: number }[];
};

const MyRoutesScreen = ({ userData }: { userData?: UserData | null }) => {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { session } = useSession();

  const fetchRoutes = useCallback(async () => {
    try {
      const response = await axios.get<Route[]>(
        "http://192.168.56.1:8000/api/route/my-routes",
        {
          headers: {
            Authorization: `Bearer ${session?.token}`,
          },
        }
      );
      setRoutes(response.data);
    } catch (error) {
      console.error("Error fetching routes:", error);
      Alert.alert("Error", "No se pudieron cargar las rutas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session]);

  useEffect(() => {
    if (userData) {
      fetchRoutes();
    }
  }, [userData, fetchRoutes]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRoutes();
  };

  const handleRoutePress = (route: Route) => {
    // Navegar a detalles de la ruta
    router.push(`/driver/RouteDetails?id=${route.id}`);
  };

  const handleEditRoute = (route: Route) => {
    // Navegar a editar ruta
    router.push(`/driver/EditRoute?id=${route.id}`);
  };

  const handleDeleteRoute = (route: Route) => {
    Alert.alert(
      "Eliminar Ruta",
      `¿Estás seguro de que quieres eliminar la ruta "${route.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`http://192.168.56.1:8000/api/route/${route.id}`, {
                headers: {
                  Authorization: `Bearer ${session?.token}`,
                },
              });
              setRoutes(routes.filter((r) => r.id !== route.id));
              Alert.alert("Éxito", "Ruta eliminada correctamente");
            } catch (error) {
              console.error("Error deleting route:", error);
              Alert.alert("Error", "No se pudo eliminar la ruta");
            }
          },
        },
      ]
    );
  };

  const renderRoute = ({ item }: { item: Route }) => (
    <RouteCard
      route={item}
      onPress={handleRoutePress}
      onEdit={handleEditRoute}
      onDelete={handleDeleteRoute}
    />
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="mt-2 text-gray-600">Cargando tus rutas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={routes}
        renderItem={renderRoute}
        keyExtractor={(item) => item.id}
        className="px-2 pt-4"
        ListHeaderComponent={
          <View className="flex-row justify-between items-center mb-4 px-2">
            <Text className="text-2xl font-bold text-gray-800">Mis Rutas</Text>
            <TouchableOpacity
              className="bg-indigo-600 rounded-full p-3 shadow-lg"
              onPress={() => router.push("/driver/AddRoute")}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20 px-4">
            <Ionicons name="map-outline" size={64} color="#9ca3af" />
            <Text className="text-gray-500 text-center mt-4 mb-2">
              No tienes rutas guardadas
            </Text>
            <Text className="text-gray-400 text-center text-sm mb-6">
              Crea tu primera ruta para comenzar a ofrecer viajes
            </Text>
            <TouchableOpacity
              className="bg-indigo-600 py-3 px-6 rounded-lg flex-row items-center"
              onPress={() => router.push("/driver/AddRoute")}
            >
              <Ionicons name="add-outline" size={20} color="white" />
              <Text className="text-white font-bold ml-2">
                Crear mi primera ruta
              </Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4f46e5"]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

export default MyRoutesScreen;
