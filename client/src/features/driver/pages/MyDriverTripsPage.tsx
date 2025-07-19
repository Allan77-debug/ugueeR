import React, { useState, useEffect, useCallback } from "react";
// Rutas de importación ajustadas:
import {
  DriverTrip,
  DriverRoute,
  DriverVehicle,
} from "../../../types/driver.types";
import {
  getDriverTrips,
  addDriverTrip,
  deleteDriverTrip,
  getDriverRoutes,
  getDriverVehicles, // Necesitamos estos para el formulario
} from "../../../services/driverDataService";
import DriverTripCard from "../components/cards/DriverTripCard";
import DriverTripForm from "../components/forms/DriverTripForm";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import { PlusCircle } from "lucide-react";
import styles from "./MyDriverRoutesPage.module.css"; // O './MyDriverTripsPage.module.css'

const MyDriverTripsPage: React.FC = () => {
  const [trips, setTrips] = useState<DriverTrip[]>([]);
  const [availableRoutes, setAvailableRoutes] = useState<DriverRoute[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<DriverVehicle[]>(
    []
  );

  const [isLoading, setIsLoading] = useState(true);
  const [loadingFormData, setLoadingFormData] = useState(true); // Para cargar rutas y vehículos para el form
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPageData = useCallback(async () => {
    setIsLoading(true);
    setLoadingFormData(true);
    setError(null);
    try {
      // Cargar todo en paralelo
      const [tripsData, routesData, vehiclesData] = await Promise.all([
        getDriverTrips(),
        getDriverRoutes(),
        getDriverVehicles(),
      ]);
      setTrips(tripsData);
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

  const handleAddTrip = async (formData: Omit<DriverTrip, "id">) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await addDriverTrip(formData);
      setShowAddModal(false);
      await fetchPageData(); // Re-fetch todo para consistencia, o solo trips
    } catch (error) {
      console.error("Error adding trip:", error);
      setError("No se pudo publicar el viaje. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrip = async (tripId: number) => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar este viaje publicado?"
      )
    )
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
            disabled={loadingFormData || !canAddTrip} // Deshabilita si no hay rutas/vehículos o están cargando
            title={
              !canAddTrip && !loadingFormData
                ? "Debes tener rutas y vehículos registrados para publicar un viaje"
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
          {" "}
          {/* Podrías darle un estilo diferente */}
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
          <p>
            Crea un viaje para que los pasajeros puedan encontrarlo y reservar.
          </p>
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
