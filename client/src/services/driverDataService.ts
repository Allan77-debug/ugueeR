// Ruta: UGUEER/client/src/services/driverDataService.ts
import {
  DriverProfile,
  DriverRoute,
  DriverVehicle,
  DriverTrip,
  AddTripPayload,
} from "../types/driver.types";

import axios from "axios";
import authService from "./authService";
// Helper para obtener el token usando el servicio de auth
const getAuthToken = () => {
  return authService.getToken();
};

// Helper para crear las cabeceras de autenticación usando el servicio de auth
const getAuthHeaders = (): { [key: string]: string } => {
  return authService.getAuthHeaders();
};

export const getDriverProfile = async (): Promise<DriverProfile> => {
  const storedUser = localStorage.getItem("userData");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const uid = user?.uid;

  if (!uid) throw new Error("No se encontró el UID del usuario logueado.");

  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/api/users/profile/${uid}/`,
      {
        headers: getAuthHeaders(),
      }
    );

    const userProfileFromApi = response.data;

    return {
      name: userProfileFromApi.full_name || "Nombre no disponible",
      university:
        userProfileFromApi.institution_name || "Universidad no especificada",
      rating: userProfileFromApi.rating || 5.0,
      isDriver: userProfileFromApi.driver_state === "aprobado",
      avatarUrl: userProfileFromApi.avatar_url || undefined,
    };
  } catch (error) {
    console.error("Error al obtener el perfil del conductor:", error);
    throw new Error("No se pudo obtener el perfil del conductor");
  }
};

// --- Rutas del Conductor ---
// Define the interface for the route data from API
interface ApiRouteData {
  id: number;
  startLocation: string;
  destination: string;
  startPointCoords: [number, number];
  endPointCoords: [number, number];
}

export const getDriverRoutes = async (): Promise<DriverRoute[]> => {
  try {
    const response = await axios.get(
      "http://127.0.0.1:8000/api/route/my-routes/",
      {
        headers: getAuthHeaders(),
      }
    );

    const routesFromApi = response.data;

    //console.log("Rutas recibidas:", routesFromApi);

    // Mapear snake_case a camelCase si es necesario.
    // En este caso, los nombres de los campos ya coinciden bastante bien.
    return routesFromApi.map((route: ApiRouteData) => ({
      id: route.id,
      startLocation: route.startLocation,
      destination: route.destination,
      startPointCoords: route.startPointCoords,
      endPointCoords: route.endPointCoords,
    }));
  } catch (error: any) {
    const message =
      error.response?.data?.detail ||
      "Error al obtener las rutas del conductor";
    throw new Error(message);
  }
};

export const addDriverRoute = async (
  newRouteData: Omit<DriverRoute, "id">
): Promise<DriverRoute> => {
  try {
    // Recupera el driverId del usuario actual
    const storedUser = localStorage.getItem("userData");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const driverId = user?.uid;

    const dataToSend = {
      ...newRouteData,
      driver: driverId, // Este campo es el que espera el backend
    };

    //console.log("Datos enviados:", dataToSend);

    const response = await axios.post(
      "http://127.0.0.1:8000/api/route/create/",
      dataToSend,
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data; // Devuelve la nueva ruta creada
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error || "Error al agregar la nueva ruta";
    throw new Error(errorMessage);
  }
};

export const deleteDriverRoute = async (routeId: number): Promise<void> => {
  try {
    await axios.delete(`http://127.0.0.1:8000/api/route/${routeId}/delete/`, {
      headers: getAuthHeaders(),
    });
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error || "Error al eliminar la ruta";
    throw new Error(errorMessage);
  }
};

// Helper para obtener el token. Podría estar en un archivo authService.ts

export const getDriverVehicles = async (): Promise<DriverVehicle[]> => {
  try {
    const response = await axios.get(
      "http://127.0.0.1:8000/api/vehicle/my-vehicles/",
      {
        headers: getAuthHeaders(),
      }
    );
    //console.log("Vehiculos recibidos:", response.data);
    return response.data; // axios ya convierte el JSON automáticamente
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error || "Error al obtener los vehículos";
    throw new Error(errorMessage);
  }
};

export const deleteDriverVehicle = async (vehicleId: number): Promise<void> => {
  try {
    await axios.delete(
      `http://127.0.0.1:8000/api/vehicle/${vehicleId}/delete/`,
      {
        headers: getAuthHeaders(),
      }
    );
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error || "Error al eliminar el vehículo";
    throw new Error(errorMessage);
  }
};

export const addDriverVehicle = async (
  newVehicleData: Omit<DriverVehicle, "id" | "imageUrl">
): Promise<DriverVehicle> => {
  try {
    // Recupera el driverId del usuario actual
    const storedUser = localStorage.getItem("userData");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const driverId = user?.uid;

    const dataToSend = {
      driver: driverId,
      plate: newVehicleData.plate,
      brand: newVehicleData.brand,
      model: newVehicleData.model,
      vehicle_type: newVehicleData.vehicleType, // Este ya está bien por la interfaz actual
      category: newVehicleData.category,
      soat: newVehicleData.soat,
      tecnomechanical: newVehicleData.tecnomechanical,
      capacity: newVehicleData.capacity,
    };

    //console.log("Datos de vehiculos enviados:", dataToSend);
    const response = await axios.post(
      "http://127.0.0.1:8000/api/vehicle/vehicles/register/", // o URL completa si no estás en modo proxy
      dataToSend,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data; // Axios ya convierte automáticamente JSON a objeto JS
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error || "Error al agregar el vehículo";
    //console.error("Detalles del error:", error.response?.data);
    throw new Error(errorMessage);
  }
};

export const inspectVehicle = async (
  vehicleId: number
): Promise<DriverVehicle | null> => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/api/vehicle/vehicles/${vehicleId}/`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw new Error("Error al inspeccionar el vehículo");
  }
};

// --- Viajes Publicados por el Conductor ---
// Define the interface for the trip data from API
// Interfaz para la respuesta de la API (es importante que sea correcta)
interface ApiTripData {
  id: number;
  route: {
    // El objeto Route está anidado
    startLocation: string;
    destination: string;
  };
  vehicle: {
    // El objeto Vehicle está anidado
    brand: string;
    model: string; // Añadimos el modelo para más detalle
    category: string;
  };
  price: number;
  time: string;
  available_seats: number; // La API envía este campo directamente
  travel_state: string;
}

// Esta función ahora solo obtiene los datos CRUDOS.
// El tipo de retorno `any[]` es intencional porque no queremos forzar una estructura aquí.
export const getDriverTrips = async (): Promise<any[]> => {
  try {
    const storedUser = localStorage.getItem("userData");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const driverId = user?.uid;

    if (!driverId) {
      console.error("Driver ID no encontrado en getDriverTrips");
      return []; // Devuelve un array vacío si no hay ID
    }

    const response = await axios.get(
      `http://127.0.0.1:8000/api/travel/info/${driverId}/`,
      { headers: getAuthHeaders() }
    );

    // Simplemente devuelve los datos tal como vienen de la API.
    return response.data;
  } catch (error) {
    console.error("Error al obtener los viajes:", error);
    throw new Error("Error al obtener los viajes"); // O devuelve [], throw es mejor para que el `catch` del componente lo maneje
  }
};

export const addDriverTrip = async (
  newTripPayload: AddTripPayload
): Promise<DriverTrip> => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/travel/create/",
      newTripPayload,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || "Error al publicar el viaje";
    throw new Error(message);
  }
};

export const deleteDriverTrip = async (tripId: number): Promise<void> => {
  try {
    await axios.delete(
      `http://127.0.0.1:8000/api/travel/travel/delete/${tripId}/`,
      {
        headers: getAuthHeaders(),
      }
    );
  } catch (error) {
    throw new Error("Error al eliminar el viaje");
  }
};
