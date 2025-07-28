import React, { useState, useEffect, useCallback } from "react";
// Rutas de importación ajustadas:
import {
  DriverTrip,
  DriverRoute,
  DriverVehicle,
  AddTripPayload, // <-- Importa la interfaz del payload
} from "../../../types/driver.types";
import {
  getDriverTrips,
  addDriverTrip,
  deleteDriverTrip,
  getDriverRoutes,
  getDriverVehicles,
} from "../../../services/driverDataService";
import DriverTripCard from "../components/cards/DriverTripCard";
// Importamos el formulario y su tipo de datos de salida
import DriverTripForm, {
  TripFormData,
} from "../components/forms/DriverTripForm";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import { PlusCircle } from "lucide-react";
import styles from "./MyDriverRoutesPage.module.css";

const MyDriverTripsPage: React.FC = () => {
  const [trips, setTrips] = useState<DriverTrip[]>([]);
  const [availableRoutes, setAvailableRoutes] = useState<DriverRoute[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<DriverVehicle[]>(
    []
  );

  const [isLoading, setIsLoading] = useState(true);
  const [loadingFormData, setLoadingFormData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPageData = useCallback(async () => {
    setIsLoading(true);
    setLoadingFormData(true);
    setError(null);
    try {
      // 1. Obtener todos los datos necesarios en paralelo. Ahora estamos seguros
      // de que getDriverTrips() devuelve los datos crudos con IDs.
      const [tripsDataFromApi, routesData, vehiclesData] = await Promise.all([
        getDriverTrips(),
        getDriverRoutes(),
        getDriverVehicles(),
      ]);

      // 2. Crear mapas para búsqueda rápida, como antes.
      const routesMap = new Map(routesData.map((route) => [route.id, route]));
      const vehiclesMap = new Map(
        vehiclesData.map((vehicle) => [vehicle.id, vehicle])
      );

      // 3. Ensamblar los datos para la UI. Esta lógica ahora funcionará.
      const assembledTrips: DriverTrip[] = tripsDataFromApi.map((trip: any) => {
        // Busca los detalles completos usando los IDs del viaje
        const routeDetails = routesMap.get(trip.route);
        const vehicleDetails = vehiclesMap.get(trip.vehicle);

        // Construye el objeto `DriverTrip` que la UI espera
        return {
          id: trip.id,

          startLocation: routeDetails?.startLocation || "Origen no disponible",
          destination: routeDetails?.destination || "Destino no disponible",

          vehicleType: vehicleDetails
            ? `${vehicleDetails.category} - ${vehicleDetails.brand}`.trim()
            : "Vehículo no disponible",

          price: trip.price,
          departureDateTime: trip.time, // <- Esto ahora recibirá el string de fecha correcto

          // Parche temporal: usa la capacidad total del vehículo.
          // Lo ideal es que el backend envíe el número real de sillas disponibles.
          availableSeats: vehicleDetails?.capacity ?? 0,

          travelState: trip.travel_state,
        };
      });

      // 4. Actualizar el estado con los datos ya completos
      setTrips(assembledTrips);
      setAvailableRoutes(routesData);
      setAvailableVehicles(vehiclesData);
    } catch (err) {
      console.error("Error fetching page data:", err);
      setError(
        "No se pudieron cargar los datos de la página. Inténtalo de nuevo."
      );
    } finally {
      setIsLoading(false);
      setLoadingFormData(false);
    }
  }, []);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  // --- FUNCIÓN MODIFICADA ---
  // Ahora espera `TripFormData` del formulario
  const handleAddTrip = async (formData: TripFormData) => {
    setIsSubmitting(true);
    setError(null);

    // 1. Obtener el ID del conductor del localStorage
    const storedUser = localStorage.getItem("userData");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const driverId = user?.uid;

    if (!driverId) {
      setError(
        "No se pudo identificar al conductor. Por favor, inicia sesión de nuevo."
      );
      setIsSubmitting(false);
      return;
    }

    // 2. Construir el payload que la API espera (AddTripPayload)
    const tripPayload: AddTripPayload = {
      driver: driverId,
      route: formData.selectedRouteId,
      vehicle: formData.selectedVehicleId,
      price: formData.price,
      time: new Date(formData.departureDateTime).toISOString(),
      travel_state: "scheduled", // Estado por defecto al crear un viaje
      // NOTA: 'availableSeats' no está en `AddTripPayload`, por lo que no se envía.
      // El backend debería calcularlo basado en la capacidad del vehículo.
    };
    // --- AÑADE ESTA LÍNEA PARA DEPURAR ---
    console.log("Enviando este payload a la API:", tripPayload);

    try {
      // 3. Llamar a la API con el payload correcto
      await addDriverTrip(tripPayload);
      setShowAddModal(false);
      await fetchPageData(); // Refrescar los datos de la página
    } catch (error: any) {
      console.error("Error adding trip:", error);
      setError(
        error.message || "No se pudo publicar el viaje. Inténtalo de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrip = async (tripId: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este viaje?"))
      return;
    setError(null);
    try {
      await deleteDriverTrip(tripId);
      setTrips((prevTrips) => prevTrips.filter((t) => t.id !== tripId));
    } catch (error) {
      console.error("Error deleting trip:", error);
      setError("No se pudo eliminar el viaje. Inténtalo de nuevo.");
    }
  };

  const canAddTrip = availableRoutes.length > 0 && availableVehicles.length > 0;

  if (isLoading) {
    return <div className={styles.loadingState}>Cargando viajes...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <h1>Mis Viajes</h1>
        <div className={styles.headerActions}>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            leftIcon={<PlusCircle size={18} />}
            disabled={loadingFormData || !canAddTrip}
            title={
              !canAddTrip && !loadingFormData
                ? "Debes tener rutas y vehículos para publicar un viaje"
                : ""
            }
          >
            Publicar Nuevo Viaje
          </Button>
        </div>
      </header>

      {error && <div className={styles.errorMessageGlobal}>{error}</div>}

      {!loadingFormData && !canAddTrip && !error && (
        <div className={`${styles.emptyState} ${styles.warningState}`}>
          <p>Para publicar un viaje, primero necesitas:</p>
          <ul>
            {availableRoutes.length === 0 && (
              <li>Definir al menos una ruta en "Mis Rutas".</li>
            )}
            {availableVehicles.length === 0 && (
              <li>Registrar al menos un vehículo en "Mis Vehículos".</li>
            )}
          </ul>
        </div>
      )}

      {trips.length === 0 && !isLoading && !error && canAddTrip && (
        <div className={styles.emptyState}>
          <p>Aún no has publicado ningún viaje.</p>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            size="large"
            leftIcon={<PlusCircle size={20} />}
            disabled={loadingFormData}
          >
            Publicar Mi Primer Viaje
          </Button>
        </div>
      )}

      {trips.length > 0 && (
        <div className={styles.cardsGrid}>
          {trips.map((trip) => (
            <DriverTripCard
              key={trip.id}
              trip={trip}
              onDelete={handleDeleteTrip}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => !isSubmitting && setShowAddModal(false)}
        title="Publicar Nuevo Viaje"
      >
        {loadingFormData ? (
          <p>Cargando datos para el formulario...</p>
        ) : !canAddTrip ? (
          <p>
            Por favor, registra rutas y vehículos antes de publicar un viaje.
          </p>
        ) : (
          <DriverTripForm
            // La prop `onSubmit` ahora está conectada a la nueva función `handleAddTrip`
            onSubmit={handleAddTrip}
            isSubmitting={isSubmitting}
            onCancel={() => setShowAddModal(false)}
            availableRoutes={availableRoutes}
            availableVehicles={availableVehicles}
          />
        )}
      </Modal>
    </div>
  );
};

export default MyDriverTripsPage;
