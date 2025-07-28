import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/hooks/ctx";
import axios from "axios";
import { UserData } from "../interfaces/interfaces";

type Route = {
  id: string;
  name: string;
  origin: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  stops: { latitude: number; longitude: number }[];
};

const initialRoutes: Route[] = [
  {
    id: "1",
    name: "Casa a Universidad",
    origin: { latitude: 6.2009, longitude: -75.5785 }, // Envigado
    destination: { latitude: 6.2013, longitude: -75.5773 }, // EAFIT
    stops: [
      { latitude: 6.2009, longitude: -75.5785 },
      { latitude: 6.201, longitude: -75.578 },
      { latitude: 6.2013, longitude: -75.5773 },
    ],
  },
  // Agrega más rutas aquí si es necesario
];

const MyRoutesScreen = () => {
  const router = useRouter();
  const [routes, setRoutes] = React.useState<Route[]>(initialRoutes);
  const { session, signOut } = useSession();
  const [loading, setLoading] = React.useState(false);
  const [userData, setUserData] = React.useState<UserData | null>(null);

  useEffect(() => {
    // Lógica para obtener datos del usuario y viajes (similar a tu código web)
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulación de llamadas a la API
        const { data: userRes } = await axios.get<UserData>(
          `http://localhost:8000/api/users/profile/${session?.uid}`,
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

  const renderRoute = ({ item }: { item: Route }) => (
    <View style={styles.routeItem}>
      <Text style={styles.routeName}>{item.name}</Text>
      <TouchableOpacity style={styles.detailsButton}>
        <Text style={styles.detailsButtonText}>Ver Detalles</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text>Cargando rutas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map} // MapView might not support className, so style is kept
        initialRegion={{
          latitude: 6.2011,
          longitude: -75.5779,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation={true}
      >
        {routes.map((route) => (
          <React.Fragment key={route.id}>
            <Marker coordinate={route.origin} title="Origen" pinColor="green" />
            <Marker
              coordinate={route.destination}
              title="Destino"
              pinColor="blue"
            />
            <Polyline
              coordinates={route.stops}
              strokeColor="#FF0000"
              strokeWidth={3}
            />
          </React.Fragment>
        ))}
      </MapView>

      <View style={styles.listContainer}>
        <FlatList
          data={routes}
          renderItem={renderRoute}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tienes rutas guardadas.</Text>
          }
        />
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/driver/AddRoute")}
      >
        <Ionicons name="add-outline" size={24} color="white" />
        <Text style={styles.addButtonText}>Agregar Nueva Ruta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  map: {
    height: "45%",
    width: "100%",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  routeItem: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  routeName: {
    fontSize: 16,
    fontWeight: "600",
  },
  detailsButton: {
    backgroundColor: "#eef2ff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  detailsButtonText: {
    color: "#4f46e5",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#6b7280",
  },
  addButton: {
    backgroundColor: "#4f46e5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    margin: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default MyRoutesScreen;
