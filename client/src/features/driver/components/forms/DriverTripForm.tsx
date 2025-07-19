import React, { useState, useEffect } from "react";
// Rutas de importación ajustadas:
import {
  DriverTrip,
  DriverRoute,
  DriverVehicle,
} from "../../../../types/driver.types";
import Button from "../common/Button";
// Asumiendo que los estilos base de formulario son reutilizables:
import styles from "./DriverRouteForm.module.css"; // O crea DriverTripForm.module.css si es muy diferente

interface DriverTripFormProps {
  onSubmit: (formData: Omit<DriverTrip, "id">) => Promise<void>;
  initialData?: Omit<DriverTrip, "id">;
  isSubmitting?: boolean;
  onCancel?: () => void;
  availableRoutes: Omit<DriverRoute, "id">[]; // Rutas predefinidas por el conductor
  availableVehicles: Omit<DriverVehicle, "id" | "imageUrl">[]; // Vehículos del conductor
}

const DriverTripForm: React.FC<DriverTripFormProps> = ({
  onSubmit,
  initialData,
  isSubmitting = false,
  onCancel,
  availableRoutes,
  availableVehicles,
}) => {
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<string>(
    initialData &&
      availableRoutes.findIndex(
        (r) =>
          r.startLocation === initialData.startLocation &&
          r.destination === initialData.destination
      ) !== -1
      ? availableRoutes
          .findIndex(
            (r) =>
              r.startLocation === initialData.startLocation &&
              r.destination === initialData.destination
          )
          .toString()
      : availableRoutes.length > 0
      ? "0"
      : "-1"
  );
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState<string>(
    initialData &&
      availableVehicles.findIndex(
        (v) => v.brand === initialData.vehicleType
      ) !== -1
      ? availableVehicles
          .findIndex((v) => v.brand === initialData.vehicleType)
          .toString()
      : availableVehicles.length > 0
      ? "0"
      : "-1"
  );
  const [price, setPrice] = useState<number>(initialData?.price || 0);
  const [departureDateTime, setDepartureDateTime] = useState(
    initialData?.departureDateTime
      ? initialData.departureDateTime.substring(0, 16)
      : ""
  ); // Formato YYYY-MM-DDTHH:mm
  const [availableSeats, setAvailableSeats] = useState<number>(
    initialData?.availableSeats || 1
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      const routeIdx = availableRoutes.findIndex(
        (r) =>
          r.startLocation === initialData.startLocation &&
          r.destination === initialData.destination
      );
      const vehicleIdx = availableVehicles.findIndex(
        (v) => v.brand === initialData.vehicleType
      ); // Asume vehicleType es la marca por simplicidad

      setSelectedRouteIndex(
        routeIdx !== -1
          ? routeIdx.toString()
          : availableRoutes.length > 0
          ? "0"
          : "-1"
      );
      setSelectedVehicleIndex(
        vehicleIdx !== -1
          ? vehicleIdx.toString()
          : availableVehicles.length > 0
          ? "0"
          : "-1"
      );
      setPrice(initialData.price || 0);
      setDepartureDateTime(
        initialData.departureDateTime
          ? initialData.departureDateTime.substring(0, 16)
          : ""
      );
      setAvailableSeats(initialData.availableSeats || 1);
    } else {
      setSelectedRouteIndex(availableRoutes.length > 0 ? "0" : "-1");
      setSelectedVehicleIndex(availableVehicles.length > 0 ? "0" : "-1");
      setPrice(0);
      setDepartureDateTime("");
      setAvailableSeats(1);
    }
  }, [initialData, availableRoutes, availableVehicles]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (
      selectedRouteIndex === "-1" ||
      !availableRoutes[parseInt(selectedRouteIndex)]
    )
      newErrors.route = "Debe seleccionar una ruta.";
    if (
      selectedVehicleIndex === "-1" ||
      !availableVehicles[parseInt(selectedVehicleIndex)]
    )
      newErrors.vehicle = "Debe seleccionar un vehículo.";
    if (price <= 0) newErrors.price = "El precio debe ser mayor a cero.";
    if (!departureDateTime)
      newErrors.departureDateTime = "La fecha y hora de salida son requeridas.";
    else if (new Date(departureDateTime) <= new Date())
      newErrors.departureDateTime = "La fecha y hora deben ser futuras.";
    if (availableSeats <= 0)
      newErrors.availableSeats = "Las sillas disponibles deben ser al menos 1.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !validateForm() ||
      isSubmitting ||
      selectedRouteIndex === "-1" ||
      selectedVehicleIndex === "-1"
    )
      return;

    const routeData = availableRoutes[parseInt(selectedRouteIndex)];
    const vehicleData = availableVehicles[parseInt(selectedVehicleIndex)];

    await onSubmit({
      startLocation: routeData.startLocation,
      destination: routeData.destination,
      vehicleType: vehicleData.brand, // O una combinación de category + brand
      price,
      departureDateTime,
      availableSeats,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <div className={styles.formGroup}>
        <label htmlFor="route">Ruta Predefinida</label>
        <select
          id="route"
          value={selectedRouteIndex}
          onChange={(e) => {
            setSelectedRouteIndex(e.target.value);
            if (errors.route) setErrors((prev) => ({ ...prev, route: "" }));
          }}
          disabled={isSubmitting || availableRoutes.length === 0}
          className={errors.route ? styles.inputError : ""}
        >
          {availableRoutes.length === 0 && (
            <option value="-1" disabled>
              No hay rutas definidas
            </option>
          )}
          {availableRoutes.map((route, index) => (
            <option key={index} value={index.toString()}>
              {route.startLocation} → {route.destination}
            </option>
          ))}
        </select>
        {errors.route && <p className={styles.errorMessage}>{errors.route}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="vehicle">Vehículo</label>
        <select
          id="vehicle"
          value={selectedVehicleIndex}
          onChange={(e) => {
            setSelectedVehicleIndex(e.target.value);
            if (errors.vehicle) setErrors((prev) => ({ ...prev, vehicle: "" }));
          }}
          disabled={isSubmitting || availableVehicles.length === 0}
          className={errors.vehicle ? styles.inputError : ""}
        >
          {availableVehicles.length === 0 && (
            <option value="-1" disabled>
              No hay vehículos registrados
            </option>
          )}
          {availableVehicles.map((vehicle, index) => (
            <option key={index} value={index.toString()}>
              {vehicle.category} - {vehicle.brand}
            </option>
          ))}
        </select>
        {errors.vehicle && (
          <p className={styles.errorMessage}>{errors.vehicle}</p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="departureDateTime">
          Fecha y Hora de Salida del Viaje
        </label>
        <input
          type="datetime-local"
          id="departureDateTime"
          value={departureDateTime}
          onChange={(e) => {
            setDepartureDateTime(e.target.value);
            if (errors.departureDateTime)
              setErrors((prev) => ({ ...prev, departureDateTime: "" }));
          }}
          disabled={isSubmitting}
          className={errors.departureDateTime ? styles.inputError : ""}
          min={new Date().toISOString().substring(0, 16)} // No permite fechas pasadas
        />
        {errors.departureDateTime && (
          <p className={styles.errorMessage}>{errors.departureDateTime}</p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="price">Precio por Silla (COP)</label>
        <input
          type="number"
          id="price"
          value={price}
          onChange={(e) => {
            setPrice(Number(e.target.value));
            if (errors.price) setErrors((prev) => ({ ...prev, price: "" }));
          }}
          placeholder="Ej: 5000"
          min="0"
          disabled={isSubmitting}
          className={errors.price ? styles.inputError : ""}
        />
        {errors.price && <p className={styles.errorMessage}>{errors.price}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="availableSeats">Sillas Disponibles</label>
        <input
          type="number"
          id="availableSeats"
          value={availableSeats}
          onChange={(e) => {
            setAvailableSeats(Number(e.target.value));
            if (errors.availableSeats)
              setErrors((prev) => ({ ...prev, availableSeats: "" }));
          }}
          min="1"
          // max podría ser la capacidad del vehículo seleccionado
          placeholder="Ej: 3"
          disabled={isSubmitting}
          className={errors.availableSeats ? styles.inputError : ""}
        />
        {errors.availableSeats && (
          <p className={styles.errorMessage}>{errors.availableSeats}</p>
        )}
      </div>

      <div className={styles.formActions}>
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="secondary"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={
            isSubmitting ||
            availableRoutes.length === 0 ||
            availableVehicles.length === 0
          }
        >
          {isSubmitting
            ? initialData
              ? "Guardando..."
              : "Publicando..."
            : initialData
            ? "Guardar Cambios"
            : "Publicar Viaje"}
        </Button>
      </div>
    </form>
  );
};

export default DriverTripForm;
