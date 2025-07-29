import { Route } from "expo-router";

interface UserData {
  uid: number;
  full_name: string;
  user_type: string;
  institutional_mail: string;
  student_code: string;
  institution_name?: string;
  has_applied_driver?: boolean;
  driver_state?: string;
  uphone?: string;
}

interface RouteInfo {
  id: number;
  startLocation: string;
  destination: string;
  departure_time: string;
}

interface Vehicle {
  id: number;
  driver: number;
  plate: string;
  brand: string;
  model: string;
  vehicle_type: string;
  category: string;
  soat?: string;
  tecnomechanical?: string;
  capacity: number;
}

interface Driver {
  user: UserData;
  validate_state: string;
}

interface Travel {
  id: number;
  time: string;
  travel_state: string;
  price: number;
  driver: Driver;
  vehicle: Vehicle;
  route?: RouteInfo;
  driver_score: number | null;
  available_seats: number;
  reservations?: {
    id: number;
    user: {
      uid: number;
      full_name: string;
      uphone: string;
      institutional_mail: string;
    };
    status: string;
  }[];
}

interface DriverTrip {
  id: number;
  startLocation: string;
  destination: string;
  vehicleType: string;
  price: number;
  departureDateTime: string;
  availableSeats: number;
  travelState: "scheduled" | "in_progress" | "completed" | "cancelled";
  reservations?: {
    id: number;
    user: {
      uid: number;
      full_name: string;
      uphone: string;
      institutional_mail: string;
    };
    status: string;
  }[];
}

interface DriverRoute {
  id: number;
  startLocation: string;
  destination: string;
  startPointCoords: number[];
  endPointCoords: number[];
}

interface DriverVehicle {
  id: number;
  category: string;
  brand: string;
  capacity: number;
  vehicleType: string;
}

interface AddTripPayload {
  driver: number;
  route: number;
  vehicle: number;
  price: number;
  time: string;
  travel_state: string;
}

interface TripFormData {
  selectedRouteId: number;
  selectedVehicleId: number;
  price: number;
  departureDateTime: string;
}

// --- Prop Types ---
interface IconProps {
  icon: React.ElementType;
  size?: number;
  color?: string;
}

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
}

interface TripCardProps {
  travel: Travel;
  onReserve: (travelId: number) => void;
  isReserving: boolean;
  isReserved?: boolean;
  session?: {
    token: string;
    uid: number;
  } | null;
}

interface ProfileHeaderProps {
  userData: UserData | null;
  pathname: string;
  onLogout: () => void;
}

interface QuickActionsProps {
  driverState?: string;
  onNavigate: (path: Route) => void;
  onApply: () => void;
}

interface TravelFeedProps {
  travels: Travel[];
  onReserve: (travelId: number) => void;
  reservingTravel: number | null;

  isDriverView?: boolean;
}

export type {
  UserData,
  RouteInfo,
  Vehicle,
  Driver,
  Travel,
  IconProps,
  ButtonProps,
  StatCardProps,
  TripCardProps,
  ProfileHeaderProps,
  QuickActionsProps,
  TravelFeedProps,
  DriverTrip,
  DriverRoute,
  AddTripPayload,
  TripFormData,
};
