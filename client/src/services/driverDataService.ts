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

// --- Profile ---
export const getDriverProfile = async (): Promise<DriverProfile> => {
  // TODO: Reemplazar con llamada a API GET /api/driver/profile
  return simulateApiCall(mockDriverProfileData);
};

// --- Rutas del Conductor ---
export const getDriverRoutes = async (): Promise<DriverRoute[]> => {
  // TODO: Reemplazar con llamada a API GET /api/driver/routes
  return simulateApiCall([...mockDriverRoutes]); // Devuelve una copia para evitar mutaciones directas del mock
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

// --- Vehículos del Conductor ---
export const getDriverVehicles = async (): Promise<DriverVehicle[]> => {
  // TODO: Reemplazar con llamada a API GET /api/driver/vehicles
  return simulateApiCall([...mockDriverVehicles]);
};

export const addDriverVehicle = async (
  newVehicleData: Omit<DriverVehicle, "id" | "imageUrl">
): Promise<DriverVehicle> => {
  // TODO: Reemplazar con llamada a API POST /api/driver/vehicles
  // Manejo de imagen (newVehicleData.imageUrl) sería más complejo
  const addedVehicle = serviceAddVehicle(newVehicleData);
  return simulateApiCall(addedVehicle);
};

export const deleteDriverVehicle = async (vehicleId: number): Promise<void> => {
  // TODO: Reemplazar con llamada a API DELETE /api/driver/vehicles/:vehicleId
  const success = serviceDeleteVehicle(vehicleId);
  if (!success)
    return simulateError(`Vehículo con ID ${vehicleId} no encontrado.`);
  return simulateApiCall(undefined);
};

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
