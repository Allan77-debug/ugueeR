// Ruta: UGUEER/client/src/components/features/driver/data/mockDriverData.ts
import {
  DriverProfile,
  DriverRoute,
  DriverVehicle,
  DriverTrip,
} from "../../../types/driver.types"; // Ajusta la ruta si es necesario

export let mockDriverProfileData: DriverProfile = {
  name: "Rodrigo Peña",
  university: "Universidad del Valle",
  rating: 5.0,
  isDriver: true,
  avatarUrl: "https://cdn-icons-png.flaticon.com/512/3607/3607444.png", // Puedes añadir una URL si tienes un avatar
};

export let mockDriverRoutes: DriverRoute[] = [
  {
    id: 1,
    startLocation: "Univalle Sede A",
    destination: "Centro Comercial X",
    startPointCoords: [3.3763241, -76.537],
    endPointCoords: [3.375284, -76.546372],
  },
  // ...
];

export let mockDriverVehicles: DriverVehicle[] = [
  {
    id: 101,
    plate: "KML789",
    brand: "Chevrolet",
    model: "Spark GT",
    vehicleType: "Hatchback",
    category: "Automóvil",
    capacity: 4,
    soat: "2025-06-15", // Formato YYYY-MM-DD
    tecnomechanical: "2025-03-20",
    imageUrl: undefined, // Puedes poner una URL a una imagen si tienes alguna
  },
  {
    id: 102,
    plate: "XYZ12C",
    brand: "Honda",
    model: "CB190R",
    vehicleType: "Naked", // O "Deportiva" si prefieres
    category: "Motocicleta",
    capacity: 1, // Capacidad para moto (sin contar conductor)
    soat: "2024-12-01",
    tecnomechanical: undefined, // Ejemplo: Vehículo nuevo, aún no requiere tecnomecánica
    imageUrl: undefined,
  },
  {
    id: 103,
    plate: "RST45A",
    brand: "Renault",
    model: "Logan Authentique",
    vehicleType: "Sedán",
    category: "Automóvil",
    capacity: 4,
    soat: "2025-09-30",
    tecnomechanical: "2025-09-30",
    imageUrl: undefined,
  },
  {
    id: 104,
    plate: "FTR632",
    brand: "Toyota",
    model: "Hilux",
    vehicleType: "Pickup", // O "Camioneta"
    category: "Camioneta",
    capacity: 4,
    soat: "2025-01-10",
    tecnomechanical: "2024-11-05",
    imageUrl: undefined,
  },
];

// ... (mockDriverTrips y funciones de manipulación de mocks sin cambios directos aquí

export let mockDriverTrips: DriverTrip[] = [
  {
    id: 201,
    startLocation: "Univalle Sede A", // Debería coincidir con una ruta
    destination: "Centro Comercial X",
    vehicleType: "Chevrolet Spark GT", // Debería coincidir con un vehículo
    price: 5000,
    departureDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // +2 horas desde ahora
    availableSeats: 3,
  },
  {
    id: 202,
    startLocation: "Barrio Obrero",
    destination: "Univalle Sede B",
    vehicleType: "Renault Logan",
    price: 4500,
    departureDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana a esta hora
    availableSeats: 2,
  },
];

// Funciones para manipular los mocks (simulando un backend)
// Nota: En una app real, estas operaciones las haría el backend en la BD.
// Exportamos los arrays como `let` para poder modificarlos.

// --- Rutas ---
export const addMockRoute = (
  newRouteData: Omit<DriverRoute, "id">
): DriverRoute => {
  const newRoute: DriverRoute = {
    id: Date.now(),
    startLocation: newRouteData.startLocation,
    destination: newRouteData.destination,
    startPointCoords: newRouteData.startPointCoords,
    endPointCoords: newRouteData.endPointCoords,
    // <--- Guarda la polilínea
  };
  mockDriverRoutes.push(newRoute);
  console.log("Nueva ruta mock agregada:", newRoute);
  return newRoute;
};

export const deleteMockRoute = (routeId: number): boolean => {
  const index = mockDriverRoutes.findIndex((r) => r.id === routeId);
  if (index > -1) {
    mockDriverRoutes.splice(index, 1);
    return true;
  }
  return false;
};

// --- Vehículos ---
export const addMockVehicle = (
  newVehicleData: Omit<DriverVehicle, "id" | "imageUrl">
): DriverVehicle => {
  const newVehicle: DriverVehicle = {
    ...newVehicleData,
    id: Date.now(),
  };
  mockDriverVehicles.push(newVehicle);
  return newVehicle;
};
export const deleteMockVehicle = (vehicleId: number): boolean => {
  const index = mockDriverVehicles.findIndex((v) => v.id === vehicleId);
  if (index > -1) {
    mockDriverVehicles.splice(index, 1);
    return true;
  }
  return false;
};

// --- Viajes ---
export const addMockTrip = (
  newTripData: Omit<DriverTrip, "id">
): DriverTrip => {
  const newTrip: DriverTrip = { ...newTripData, id: Date.now() };
  mockDriverTrips.push(newTrip);
  return newTrip;
};
export const deleteMockTrip = (tripId: number): boolean => {
  const index = mockDriverTrips.findIndex((t) => t.id === tripId);
  if (index > -1) {
    mockDriverTrips.splice(index, 1);
    return true;
  }
  return false;
};
