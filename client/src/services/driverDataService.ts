// Ruta: UGUEER/client/src/services/driverDataService.ts
import {
  DriverProfile,
  DriverRoute,
  DriverVehicle,
  DriverTrip,
} from "../types/driver.types";
// Ajusta la ruta para importar desde la carpeta de mocks del driver
import {
  mockDriverProfileData,
  mockDriverRoutes,
  mockDriverVehicles,
  mockDriverTrips,
  addMockRoute as serviceAddRoute, // Renombramos para evitar colisión de nombres
  deleteMockRoute as serviceDeleteRoute,
  addMockVehicle as serviceAddVehicle,
  deleteMockVehicle as serviceDeleteVehicle,
  addMockTrip as serviceAddTrip,
  deleteMockTrip as serviceDeleteTrip,
} from "../features/driver/data/mockDriverData";

const simulateApiCall = <T>(data: T, delay = 300): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay));

const simulateError = (message: string, delay = 300): Promise<never> =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error(message)), delay)
  );

const TEMP_DRIVER_ID = 40; // <--- DEFINE EL ID DEL CONDUCTOR DE PRUEBA
const TEMP_USER_UID = 40;

// // --- Profile ---
// export const getDriverProfile = async (): Promise<DriverProfile> => {
//   // TODO: Reemplazar con llamada a API GET /api/driver/profile
//   return simulateApiCall(mockDriverProfileData);
// };

export const getDriverProfile = async (): Promise<DriverProfile> => {
  // La URL del backend es `/api/users/profile/<uid>/`
  const response = await fetch(`/api/users/profile/${TEMP_USER_UID}/`);

  if (!response.ok) throw new Error("Error al obtener el perfil del conductor");

  const userProfile = await response.json();

  // Mapeamos los datos del perfil de usuario a la interfaz `DriverProfile` del frontend.
  return {
    name: userProfile.full_name,
    university: userProfile.institution_name || "Universidad no especificada",
    rating: 4.1, // El backend no devuelve rating, usamos un valor fijo temporalmente.
    isDriver: userProfile.driver_state === "aprobado",
    avatarUrl: undefined, // El backend no devuelve avatar.
  };
};

// --- Rutas del Conductor ---
export const getDriverRoutes = async (): Promise<DriverRoute[]> => {
  // TODO: Reemplazar con llamada a API GET /api/driver/routes
  return simulateApiCall([...mockDriverRoutes]); // Devuelve una copia para evitar mutaciones directas del mock
  // const response = await fetch(`/api/route/${TEMP_DRIVER_ID}/`);
  // if (!response.ok) throw new Error("Error al obtener rutas");
  // return response.json();
};

export const addDriverRoute = async (
  newRouteData: Omit<DriverRoute, "id">
): Promise<DriverRoute> => {
  // TODO: Reemplazar con llamada a API POST /api/driver/routes
  const addedRoute = serviceAddRoute(newRouteData);
  return simulateApiCall(addedRoute);
  // Para simular un error:
  // return simulateError("Error simulado al agregar ruta");
};

export const deleteDriverRoute = async (routeId: number): Promise<void> => {
  // TODO: Reemplazar con llamada a API DELETE /api/driver/routes/:routeId
  const success = serviceDeleteRoute(routeId);
  if (!success) return simulateError(`Ruta con ID ${routeId} no encontrada.`);
  return simulateApiCall(undefined); // Simula una respuesta vacía de éxito
};

// // --- Vehículos del Conductor ---
// export const getDriverVehicles = async (): Promise<DriverVehicle[]> => {
//   // TODO: Reemplazar con llamada a API GET /api/driver/vehicles
//   return simulateApiCall([...mockDriverVehicles]);
// };

// Helper para obtener el token. Podría estar en un archivo authService.ts
const getAuthToken = () => {
  return localStorage.getItem("accessToken");
};

// Helper para crear las cabeceras de autenticación
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  if (!token) return {}; // Si no hay token, devuelve cabeceras vacías
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const getDriverVehicles = async (): Promise<DriverVehicle[]> => {
  const response = await fetch("/api/vehicle/my-vehicles/", {
    headers: getAuthHeaders(), // <-- Se usan las cabeceras dinámicas
  });
  if (!response.ok) throw new Error("Error al obtener los vehículos");
  return response.json();
};

export const deleteDriverVehicle = async (vehicleId: number): Promise<void> => {
  const response = await fetch(`/api/vehicle/${vehicleId}/delete/`, {
    method: "DELETE",
    headers: getAuthHeaders(), // <-- Se usan las cabeceras dinámicas
  });
  if (!response.ok) throw new Error("Error al eliminar el vehículo");
};

export const addDriverVehicle = async (
  newVehicleData: Omit<DriverVehicle, "id" | "imageUrl">
): Promise<DriverVehicle> => {
  // Nota: Ya no necesitamos pasar el driver_id. El backend lo sabe por el token.
  // El frontend solo envía los datos del vehículo.

  const response = await fetch("/api/vehicle/vehicles/register/", {
    // O la URL final que defina el backend
    method: "POST",
    headers: getAuthHeaders(), // <-- Usa las cabeceras dinámicas
    body: JSON.stringify(newVehicleData), // Envía los datos del nuevo vehículo
  });

  if (!response.ok) {
    // Si hay un error, intentamos leer el mensaje de error del backend
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al agregar el vehículo");
  }

  return response.json();
};

// export const addDriverVehicle = async (
//   newVehicleData: Omit<DriverVehicle, "id" | "imageUrl">
// ): Promise<DriverVehicle> => {
//   // TODO: Reemplazar con llamada a API POST /api/driver/vehicles
//   // Manejo de imagen (newVehicleData.imageUrl) sería más complejo
//   const addedVehicle = serviceAddVehicle(newVehicleData);
//   return simulateApiCall(addedVehicle);
// };

// export const deleteDriverVehicle = async (vehicleId: number): Promise<void> => {
//   // TODO: Reemplazar con llamada a API DELETE /api/driver/vehicles/:vehicleId
//   const success = serviceDeleteVehicle(vehicleId);
//   if (!success)
//     return simulateError(`Vehículo con ID ${vehicleId} no encontrado.`);
//   return simulateApiCall(undefined);
// };

// (Opcional) Si necesitas una función para "inspeccionar" que podría traer más detalles
export const inspectVehicle = async (
  vehicleId: number
): Promise<DriverVehicle | null> => {
  // TODO: Reemplazar con llamada a API GET /api/driver/vehicles/:vehicleId
  const vehicle = mockDriverVehicles.find((v) => v.id === vehicleId);
  return simulateApiCall(vehicle || null);
};

// --- Viajes Publicados por el Conductor ---
export const getDriverTrips = async (): Promise<DriverTrip[]> => {
  // TODO: Reemplazar con llamada a API GET /api/driver/trips
  return simulateApiCall([...mockDriverTrips]);
};

export const addDriverTrip = async (
  newTripData: Omit<DriverTrip, "id">
): Promise<DriverTrip> => {
  // TODO: Reemplazar con llamada a API POST /api/driver/trips
  const addedTrip = serviceAddTrip(newTripData);
  return simulateApiCall(addedTrip);
};

export const deleteDriverTrip = async (tripId: number): Promise<void> => {
  // TODO: Reemplazar con llamada a API DELETE /api/driver/trips/:tripId
  const success = serviceDeleteTrip(tripId);
  if (!success) return simulateError(`Viaje con ID ${tripId} no encontrado.`);
  return simulateApiCall(undefined);
};
