import React, { useState, useEffect } from "react";
import { DriverRoute, DriverVehicle } from "../../../../types/driver.types";
import Button from "../common/Button";
import styles from "./DriverRouteForm.module.css";

export interface TripFormData {
  selectedRouteId: number;
  selectedVehicleId: number;
  price: number;
  departureDateTime: string;
  availableSeats: number;
}

interface DriverTripFormProps {
  onSubmit: (formData: TripFormData) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
  availableRoutes: DriverRoute[];
  availableVehicles: DriverVehicle[];
}

const DriverTripForm: React.FC<DriverTripFormProps> = ({
  onSubmit,
  isSubmitting = false,
  onCancel,
  availableRoutes,
  availableVehicles,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  // --- CAMBIO 1: El estado puede ser un número o nulo ---
  const [price, setPrice] = useState<number | null>(0);

  const [departureDateTime, setDepartureDateTime] = useState("");
  const [availableSeats, setAvailableSeats] = useState<number>(1);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (availableRoutes.length > 0 && !selectedRouteId) {
      setSelectedRouteId(availableRoutes[0].id.toString());
    }
    if (availableVehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(availableVehicles[0].id.toString());
    }
  }, [availableRoutes, availableVehicles, selectedRouteId, selectedVehicleId]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!selectedRouteId) newErrors.route = "Debe seleccionar una ruta.";
    if (!selectedVehicleId) newErrors.vehicle = "Debe seleccionar un vehículo.";

    // --- CAMBIO 2: La validación comprueba si es nulo o <= 0 ---
    if (price === null || price <= 0) {
      newErrors.price = "El precio debe ser mayor a cero.";
    }

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
    if (!validateForm() || isSubmitting) return;

    // Aseguramos que el precio no sea nulo antes de enviar. La validación ya lo garantiza.
    await onSubmit({
      selectedRouteId: parseInt(selectedRouteId),
      selectedVehicleId: parseInt(selectedVehicleId),
      price: price!, // El '!' indica a TypeScript que estamos seguros de que price no es nulo aquí.
      departureDateTime,
      availableSeats,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      {/* ... (Select de Ruta y Vehículo sin cambios) ... */}
      <div className={styles.formGroup}>
        <label htmlFor="route">Ruta Predefinida</label>
        <select
          id="route"
          value={selectedRouteId}
          onChange={(e) => {
            setSelectedRouteId(e.target.value);
            if (errors.route) setErrors((prev) => ({ ...prev, route: "" }));
          }}
          disabled={isSubmitting || availableRoutes.length === 0}
          className={errors.route ? styles.inputError : ""}
        >
          {availableRoutes.length === 0 ? (
            <option value="" disabled>
              No hay rutas definidas
            </option>
          ) : (
            availableRoutes.map((route) => (
              <option key={route.id} value={route.id.toString()}>
                {route.startLocation} → {route.destination}
              </option>
            ))
          )}
        </select>
        {errors.route && <p className={styles.errorMessage}>{errors.route}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="vehicle">Vehículo</label>
        <select
          id="vehicle"
          value={selectedVehicleId}
          onChange={(e) => {
            setSelectedVehicleId(e.target.value);
            if (errors.vehicle) setErrors((prev) => ({ ...prev, vehicle: "" }));
          }}
          disabled={isSubmitting || availableVehicles.length === 0}
          className={errors.vehicle ? styles.inputError : ""}
        >
          {availableVehicles.length === 0 ? (
            <option value="" disabled>
              No hay vehículos registrados
            </option>
          ) : (
            availableVehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id.toString()}>
                {`${vehicle.category} - ${vehicle.brand} (${vehicle.plate})`}
              </option>
            ))
          )}
        </select>
        {errors.vehicle && (
          <p className={styles.errorMessage}>{errors.vehicle}</p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="departureDateTime">Fecha y Hora de Salida</label>
        <input
          type="datetime-local"
          id="departureDateTime"
          value={departureDateTime}
          onChange={(e) => setDepartureDateTime(e.target.value)}
          disabled={isSubmitting}
          className={errors.departureDateTime ? styles.inputError : ""}
          min={new Date(new Date().getTime() + 5 * 60000)
            .toISOString()
            .substring(0, 16)}
        />
        {errors.departureDateTime && (
          <p className={styles.errorMessage}>{errors.departureDateTime}</p>
        )}
      </div>

      {/* --- BLOQUE DE PRECIO CORREGIDO --- */}
      <div className={styles.formGroup}>
        <label htmlFor="price">Precio por Silla (COP)</label>
        <input
          type="number"
          id="price"
          // CAMBIO 3: Si el estado es null, el valor del input es un string vacío
          value={price ?? ""}
          // CAMBIO 4: La lógica para actualizar el estado
          onChange={(e) => {
            const value = e.target.value;
            setPrice(value === "" ? null : Number(value));
            if (errors.price) setErrors((prev) => ({ ...prev, price: "" }));
          }}
          placeholder="Ej: 5000"
          min="1"
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
          onChange={(e) => setAvailableSeats(Number(e.target.value))}
          min="1"
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
          {isSubmitting ? "Publicando..." : "Publicar Viaje"}
        </Button>
      </div>
    </form>
  );
};

export default DriverTripForm;
