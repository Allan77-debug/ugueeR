// Ruta: UGUEER/client/src/services/driverDataService.ts
import {
  DriverProfile,
  DriverRoute,
  DriverVehicle,
  DriverTrip,
} from "../types/driver.types";

import axios from "axios";

const simulateApiCall = <T>(data: T, delay = 300): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay));

const simulateError = (message: string, delay = 300): Promise<never> =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error(message)), delay)
  );

// Helper para obtener el token. Podría estar en un archivo authService.ts
const getAuthToken = () => {
  return localStorage.getItem("accessToken");
};

// Helper para crear las cabeceras de autenticación
const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const getDriverProfile = async (): Promise<DriverProfile> => {
  const userUid = localStorage.getItem("userUid");

  if (!userUid) {
    throw new Error(
      "No se encontró el UID del usuario. Por favor, inicie sesión."
    );
  }

  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/api/users/profile/${userUid}/`,
      { headers: getAuthHeaders() }
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
    const response = await axios.post(
      "http://127.0.0.1:8000/api/route/create/",
      newRouteData,
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
    const response = await axios.post(
      "http://127.0.0.1:8000/api/vehicle/vehicles/register/", // o URL completa si no estás en modo proxy
      newVehicleData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data; // Axios ya convierte automáticamente JSON a objeto JS
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error || "Error al agregar el vehículo";
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
interface ApiTripData {
  id: number;
  route?: {
    startLocation: string;
    destination: string;
  };
  vehicle?: {
    brand: string;
  };
  price: number;
  time: string;
  available_seats?: number;
  travel_state: string;
}

export const getDriverTrips = async (
  driverId: number
): Promise<DriverTrip[]> => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/api/travel/info/${driverId}/`,
      {
        headers: getAuthHeaders(),
      }
    );

    const tripsFromApi = response.data;

    return tripsFromApi.map((trip: ApiTripData) => ({
      id: trip.id,
      startLocation: trip.route?.startLocation || "Origen no disponible",
      destination: trip.route?.destination || "Destino no disponible",
      vehicleType: trip.vehicle?.brand || "Vehículo no disponible",
      price: trip.price,
      departureDateTime: trip.time,
      availableSeats: trip.available_seats || 0,
      travelState: trip.travel_state,
    }));
  } catch (error: any) {
    throw new Error("Error al obtener los viajes");
  }
};

export const addDriverTrip = async (
  newTripData: Omit<DriverTrip, "id">
): Promise<DriverTrip> => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/travel/create/",
      newTripData,
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
