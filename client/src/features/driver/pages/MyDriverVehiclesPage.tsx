import React, { useState, useEffect, useCallback } from "react";
import { DriverVehicle } from "../../../types/driver.types";
import {
  getDriverVehicles,
  addDriverVehicle,
  deleteDriverVehicle,
} from "../../../services/driverDataService"; // Se eliminó inspectVehicle si no lo usas en el servicio
import DriverVehicleCard from "../components/cards/DriverVehicleCard";
import DriverVehicleForm from "../components/forms/DriverVehicleForm";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import { PlusCircle, Eye } from "lucide-react"; // Añadimos Eye para el botón de inspección si quieres
import styles from "./MyDriverRoutesPage.module.css";
// Crearemos un nuevo archivo CSS para los detalles de inspección o lo añadiremos al existente
import detailStyles from "./VehicleInspectionDetails.module.css"; // Crear este archivo

const MyDriverVehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<DriverVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal para AGREGAR/EDITAR vehículo
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [editingVehicleData, setEditingVehicleData] = useState<
    Omit<DriverVehicle, "id" | "imageUrl"> | undefined
  >(undefined);
  const [currentEditingVehicleId, setCurrentEditingVehicleId] = useState<
    string | null
  >(null);

  // Modal para INSPECCIONAR vehículo
  const [vehicleToInspect, setVehicleToInspect] =
    useState<DriverVehicle | null>(null);
  const [showInspectModal, setShowInspectModal] = useState(false);

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Obtienes los datos de la API (vienen en snake_case)
      const dataFromApi = await getDriverVehicles();

      // 2. Transformas el array de vehículos a camelCase
      const transformedVehicles = dataFromApi.map((vehicle: any) => {
        // La ': any' aquí es una forma rápida de evitar errores de tipado durante la transformación.
        // Si tienes un tipo para la respuesta de la API, úsalo en su lugar.
        return {
          id: vehicle.id,
          plate: vehicle.plate,
          brand: vehicle.brand,
          model: vehicle.model,
          category: vehicle.category,
          // --- ESTA ES LA TRANSFORMACIÓN MÁS IMPORTANTE ---
          vehicleType: vehicle.vehicle_type,
          capacity: vehicle.capacity,
          soat: vehicle.soat, // Asumo que estos también vienen en snake_case
          tecnomechanical: vehicle.tecnomechanical,
          imageUrl: vehicle.image_url,
          // Si hay más campos, añádelos aquí
        };
      });

      // 3. Guardas los datos ya transformados en el estado
      setVehicles(transformedVehicles);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("No se pudieron cargar los vehículos. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleOpenAddModal = () => {
    setEditingVehicleData(undefined); // Asegura que sea para agregar
    setCurrentEditingVehicleId(null);
    setShowAddEditModal(true);
  };

  // const handleOpenEditModal = (vehicleId: string) => { // Lógica para editar (futuro)
  //   const vehicle = vehicles.find(v => v.id === vehicleId);
  //   if (vehicle) {
  //     const { id, imageUrl, ...editableData } = vehicle;
  //     setEditingVehicleData(editableData);
  //     setCurrentEditingVehicleId(id);
  //     setShowAddEditModal(true);
  //   }
  // };

  const handleSubmitVehicleForm = async (
    formData: Omit<DriverVehicle, "id" | "imageUrl">
  ) => {
    setIsSubmittingForm(true);
    setError(null);
    try {
      if (currentEditingVehicleId && editingVehicleData) {
        // Lógica de actualización (necesitarás una función updateDriverVehicle en el servicio)
        // await updateDriverVehicle(currentEditingVehicleId, formData);
        alert("Funcionalidad de editar aún no implementada en el servicio.");
      } else {
        await addDriverVehicle(formData);
      }
      setShowAddEditModal(false);
      setEditingVehicleData(undefined);
      setCurrentEditingVehicleId(null);
      await fetchVehicles();
    } catch (error) {
      console.error("Error submitting vehicle form:", error);
      setError(
        currentEditingVehicleId
          ? "No se pudo actualizar el vehículo."
          : "No se pudo agregar el vehículo."
      );
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este vehículo?"))
      return;
    setError(null);
    try {
      await deleteDriverVehicle(vehicleId);
      setVehicles((prevVehicles) =>
        prevVehicles.filter((v) => v.id !== vehicleId)
      );
      if (vehicleToInspect?.id === vehicleId) {
        // Si el vehículo inspeccionado se elimina, cerrar el modal
        setShowInspectModal(false);
        setVehicleToInspect(null);
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      setError("No se pudo eliminar el vehículo. Inténtalo de nuevo.");
    }
  };

  const handleInspectVehicle = (vehicleId: number) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (vehicle) {
      setVehicleToInspect(vehicle);
      setShowInspectModal(true);
    } else {
      console.warn(
        `Vehículo con ID ${vehicleId} no encontrado para inspección.`
      );
      setError("No se pudo encontrar el vehículo para mostrar detalles.");
    }
  };

  const formatDateForDisplay = (dateString?: string) => {
    if (!dateString) return "No especificado";
    // Asegurarse que la fecha string es interpretada correctamente por el constructor Date
    // El formato YYYY-MM-DD que viene del input type="date" es seguro.
    try {
      const date = new Date(dateString + "T00:00:00"); // Añadir tiempo para evitar problemas de zona horaria
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  if (isLoading) {
    return <div className={styles.loadingState}>Cargando vehículos...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <h1>Mis Vehículos</h1>
        <div className={styles.headerActions}>
          <Button
            onClick={handleOpenAddModal}
            variant="primary"
            leftIcon={<PlusCircle size={18} />}
          >
            Agregar Vehículo
          </Button>
        </div>
      </header>

      {error && <div className={styles.errorMessageGlobal}>{error}</div>}

      {vehicles.length === 0 && !isLoading && !error && (
        <div className={styles.emptyState}>
          <p>Aún no has registrado ningún vehículo.</p>
          <Button
            onClick={handleOpenAddModal}
            variant="primary"
            size="large"
            leftIcon={<PlusCircle size={20} />}
          >
            Registrar Mi Primer Vehículo
          </Button>
        </div>
      )}

      {vehicles.length > 0 && (
        <div className={styles.cardsGrid}>
          {vehicles.map((vehicle) => (
            <DriverVehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onDelete={handleDeleteVehicle}
              onInspect={handleInspectVehicle} // Pasamos la función
              // onEdit={() => handleOpenEditModal(vehicle.id)} // Para el futuro
            />
          ))}
        </div>
      )}

      {/* Modal para Agregar/Editar Vehículo */}
      <Modal
        isOpen={showAddEditModal}
        onClose={() => !isSubmittingForm && setShowAddEditModal(false)}
        title={
          editingVehicleData ? "Editar Vehículo" : "Agregar Nuevo Vehículo"
        }
      >
        <DriverVehicleForm
          onSubmit={handleSubmitVehicleForm}
          initialData={editingVehicleData}
          isSubmitting={isSubmittingForm}
          onCancel={() => {
            setShowAddEditModal(false);
            setEditingVehicleData(undefined);
            setCurrentEditingVehicleId(null);
          }}
        />
      </Modal>

      {/* Modal para Inspeccionar Vehículo */}
      {vehicleToInspect && (
        <Modal
          isOpen={showInspectModal}
          onClose={() => {
            setShowInspectModal(false);
            setVehicleToInspect(null);
          }}
          title={`Detalles de ${vehicleToInspect.brand} ${vehicleToInspect.model}`}
          size="medium" // Puedes ajustar el tamaño
        >
          <div className={detailStyles.inspectionContainer}>
            {/* Si tienes imagen, la mostrarías aquí */}
            {/* {vehicleToInspect.imageUrl && (
              <img src={vehicleToInspect.imageUrl} alt="Vehículo" className={detailStyles.inspectionImage} />
            )} */}
            <div className={detailStyles.detailGrid}>
              <div className={detailStyles.detailItem}>
                <strong>Placa:</strong> <span>{vehicleToInspect.plate}</span>
              </div>
              <div className={detailStyles.detailItem}>
                <strong>Marca:</strong> <span>{vehicleToInspect.brand}</span>
              </div>
              <div className={detailStyles.detailItem}>
                <strong>Modelo/Línea:</strong>{" "}
                <span>{vehicleToInspect.model}</span>
              </div>
              <div className={detailStyles.detailItem}>
                <strong>Categoría:</strong>{" "}
                <span>{vehicleToInspect.category}</span>
              </div>
              <div className={detailStyles.detailItem}>
                <strong>Tipo Específico:</strong>{" "}
                <span>{vehicleToInspect.vehicleType || "No especificado"}</span>
              </div>
              <div className={detailStyles.detailItem}>
                <strong>Capacidad:</strong>{" "}
                <span>{vehicleToInspect.capacity} pasajero(s)</span>
              </div>
              <div className={detailStyles.detailItem}>
                <strong>Venc. SOAT:</strong>{" "}
                <span>{formatDateForDisplay(vehicleToInspect.soat)}</span>
              </div>
              <div className={detailStyles.detailItem}>
                <strong>Venc. Tecnomecánica:</strong>{" "}
                <span>
                  {formatDateForDisplay(vehicleToInspect.tecnomechanical)}
                </span>
              </div>
            </div>
            <div className={detailStyles.actions}>
              <Button
                onClick={() => {
                  setShowInspectModal(false);
                  setVehicleToInspect(null);
                }}
                variant="primary"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyDriverVehiclesPage;
