// client/src/features/driver/components/forms/DriverRouteForm.tsx (VERSIÓN SIMPLIFICADA)

import React from "react";
import Button from "../common/Button";
import { MapPin } from "lucide-react";
import styles from "./DriverRouteForm.module.css";

interface DriverRouteFormProps {
  onSubmit: () => void; // Ya no necesita pasar datos, el padre los tiene
  isSubmitting?: boolean;
  onCancel: () => void;
  onOpenMap: () => void;
  selectedStartName?: string;
  selectedEndName?: string;
}

const DriverRouteForm: React.FC<DriverRouteFormProps> = ({
  onSubmit,
  isSubmitting = false,
  onCancel,
  onOpenMap,
  selectedStartName,
  selectedEndName,
}) => {
  const canSubmit = !!selectedStartName && !!selectedEndName;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className={styles.formContainer}
    >
      <div className={styles.formGroup}>
        <label>Ruta (Inicio y Destino)</label>
        <Button
          type="button"
          onClick={onOpenMap}
          variant="secondary"
          leftIcon={<MapPin size={18} />}
          fullWidth
        >
          Abrir Mapa para Seleccionar Ruta
        </Button>
        <div className={styles.mapSelectedLocations}>
          <p>
            <strong>Inicio:</strong>{" "}
            <em>{selectedStartName || "Punto de inicio no seleccionado."}</em>
          </p>
          <p>
            <strong>Destino:</strong>{" "}
            <em>{selectedEndName || "Punto de destino no seleccionado."}</em>
          </p>
        </div>
      </div>

      <div className={styles.formActions}>
        <Button
          type="button"
          onClick={onCancel}
          variant="default"
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !canSubmit}
        >
          {isSubmitting ? "Guardando..." : "Agregar Ruta"}
        </Button>
      </div>
    </form>
  );
};

export default DriverRouteForm;
