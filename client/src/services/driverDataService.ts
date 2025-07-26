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

// // --- Profile ---
// export const getDriverProfile = async (): Promise<DriverProfile> => {
//   // TODO: Reemplazar con llamada a API GET /api/driver/profile
//   return simulateApiCall(mockDriverProfileData);
// };

export const getDriverProfile = async (): Promise<DriverProfile> => {
  // Paso 1: Obtener el UID del usuario guardado en el localStorage.
  const userUid = localStorage.getItem("userUid");

  // Si no hay UID, significa que el usuario no ha iniciado sesión.
  if (!userUid) {
    throw new Error(
      "No se encontró el UID del usuario. Por favor, inicie sesión."
    );
  }

  // Paso 2: Construir la URL que el backend espera, usando el UID.
  const response = await fetch(`/api/users/profile/${userUid}/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Error al obtener el perfil del conductor");
  }

  const userProfileFromApi = await response.json();

  // Paso 3: Mapear la respuesta de la API a la interfaz del frontend (sin cambios).

  return {
    name: userProfileFromApi.full_name || "Nombre no disponible",
    university:
      userProfileFromApi.institution_name || "Universidad no especificada",
    rating: userProfileFromApi.rating || 5.0,

    isDriver: userProfileFromApi.driver_state === "aprobado",
    avatarUrl: userProfileFromApi.avatar_url || undefined,
  };
};


// --- Rutas del Conductor ---
export const getDriverRoutes = async (): Promise<DriverRoute[]> => {
  // Asumiendo que el backend crea un endpoint `/api/route/my-routes/` que filtra por usuario autenticado.
  const response = await fetch("/api/route/my-routes/", {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Error al obtener las rutas del conductor");
  }

  const routesFromApi = await response.json();

  // Mapear snake_case a camelCase si es necesario.
  // En este caso, los nombres de los campos ya coinciden bastante bien.
  return routesFromApi.map((route: any) => ({
    id: route.id,
    startLocation: route.startLocation,
    destination: route.destination,
    startPointCoords: route.startPointCoords,
    endPointCoords: route.endPointCoords,
  }));
};


export const addDriverRoute = async (
  newRouteData: Omit<DriverRoute, "id">
): Promise<DriverRoute> => {
  // Asumiendo que el backend usa un endpoint como `/api/route/create/` para la creación.
  const response = await fetch("/api/route/create/", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(newRouteData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al agregar la nueva ruta");
  }

  return response.json();
};

export const deleteDriverRoute = async (routeId: number): Promise<void> => {
  // Asumiendo que el endpoint de eliminación es `/api/route/<id>/delete/`
  const response = await fetch(`/api/route/${routeId}/delete/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  // Una respuesta exitosa de DELETE a menudo es un 204 No Content.
  if (!response.ok && response.status !== 204) {
    throw new Error("Error al eliminar la ruta");
  }
};


// // --- Vehículos del Conductor ---
// export const getDriverVehicles = async (): Promise<DriverVehicle[]> => {
//   // TODO: Reemplazar con llamada a API GET /api/driver/vehicles
//   return simulateApiCall([...mockDriverVehicles]);
// };

// Helper para obtener el token. Podría estar en un archivo authService.ts


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
// export const inspectVehicle = async (
//   vehicleId: number
// ): Promise<DriverVehicle | null> => {
//   // TODO: Reemplazar con llamada a API GET /api/driver/vehicles/:vehicleId
//   const vehicle = mockDriverVehicles.find((v) => v.id === vehicleId);
//   return simulateApiCall(vehicle || null);
// };

export const inspectVehicle = async (
  vehicleId: number
): Promise<DriverVehicle | null> => {
  // Nota: Esta función asume que el backend ha creado un endpoint para obtener un solo vehículo.
  // Si no existe, esta función no se podrá usar. La URL es una suposición.

  const response = await fetch(`/api/vehicle/vehicles/${vehicleId}/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 404) return null; // Si no se encuentra, devolvemos null
    throw new Error("Error al inspeccionar el vehículo");
  }

  return response.json();
};

// --- Viajes Publicados por el Conductor ---
export const getDriverTrips = async (
  driverId: number
): Promise<DriverTrip[]> => {
  // Asumiendo que el backend crea un endpoint `/api/travel/my-trips/` que filtra por usuario
  const response = await fetch(`/api/travel/info/${driverId}/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error("Error al obtener los viajes");

  const tripsFromApi = await response.json();

  // Mapear snake_case a camelCase y completar datos que falten
  return tripsFromApi.map((trip: any) => ({
    id: trip.id,
    startLocation: trip.route?.startLocation || "Origen no disponible",
    destination: trip.route?.destination || "Destino no disponible",
    vehicleType: trip.vehicle?.brand || "Vehículo no disponible",
    price: trip.price,
    departureDateTime: trip.time,
    availableSeats: trip.available_seats || 0, // Asumiendo que el backend añade `available_seats`
    travelState: trip.travel_state,
  }));
};

export const addDriverTrip = async (
  newTripData: Omit<DriverTrip, "id">
): Promise<DriverTrip> => {
  // Asumiendo que el endpoint de creación es `/api/travel/create/`
  const response = await fetch("/api/travel/create/", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(newTripData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al publicar el viaje");
  }

  return response.json();
};


export const deleteDriverTrip = async (tripId: number): Promise<void> => {
  // Asumiendo que el endpoint de eliminación es `/api/travel/delete/<id>/`
  const response = await fetch(`/api/travel/travel/delete/${tripId}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok && response.status !== 204) {
    throw new Error("Error al eliminar el viaje");
  }
};
