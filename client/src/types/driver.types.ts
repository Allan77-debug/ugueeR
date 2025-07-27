// --- Tipos ---
export type LatLngTuple = [number, number];
export type Step = {
  instruction: string;
  distance?: number;
  duration?: number;
  name?: string;
  type?: number;
};
// ... (Asegúrate que RouteSegment, RouteProperties, Feature, RouteDataFromProxy están definidos aquí o importados)
// Por brevedad, los omito aquí, pero deben estar presentes
export type RouteSegment = {
  steps?: Step[];
  distance?: number;
  duration?: number;
};
export type RouteProperties = {
  segments?: RouteSegment[];
  summary?: { distance: number; duration: number };
  way_points?: [number, number];
};
export type Feature = {
  geometry: { coordinates: [number, number][] };
  properties: RouteProperties;
  bbox?: [number, number, number, number];
  type?: string;
};
export type RouteDataFromProxy = {
  type?: string;
  features: Feature[];
  bbox?: [number, number, number, number];
  metadata?: any;
};

export interface DriverProfile {
  name: string;
  university: string;
  rating: number;
  isDriver: boolean;
  avatarUrl?: string; // Opcional
}

// src/types/driver.types.ts
export interface DriverRoute {
  id: number;
  driverUid: number;
  startLocation: string; // Nombre del lugar de inicio
  destination: string; // Nombre del lugar de destino
  startPointCoords?: LatLngTuple; // Coordenadas [lat, lng]
  endPointCoords?: LatLngTuple;
  //routePathCoords?: LatLngTuple[]; // Opcional: la polilínea de la ruta
  // staticMapImageUrl?: string; // Opcional: URL a una imagen estática del mapa
}

export interface DriverVehicle {
  id: number;
  plate: string;
  brand: string;
  model: string;
  vehicleType: string;
  category: string;
  capacity: number;
  soat?: string; // Fecha de vencimiento del SOAT (opcional, formato YYYY-MM-DD)
  tecnomechanical?: string; // Fecha de vencimiento de Tecnomecánica (opcional)
  imageUrl?: string; // Opcional
}

// Coincide con la estructura JSON que espera el endpoint /travel/create/
export interface AddTripPayload {
  driver: number;
  vehicle: number;
  route: number;
  time: string; // Formato ISO "YYYY-MM-DDTHH:MM:SS"
  price: number;
  travel_state: string;
}

export interface DriverTrip {
  id: number;
  startLocation: string;
  destination: string;
  vehicleType: string;
  price: number;
  departureDateTime: string;
  availableSeats: number;
  travelState: string;
}
