import React from "react";
// Rutas de importación ajustadas:
import { DriverVehicle } from "../../../../types/driver.types";
import Button from "../common/Button";
import Card from "../common/Card";
import styles from "./DriverVehicleCard.module.css";
// import defaultVehicleImage from '../../../../../assets/default-vehicle.png'; // Imagen placeholder

interface DriverVehicleCardProps {
  vehicle: DriverVehicle;
  onDelete: (id: number) => void;
  onInspect?: (id: number) => void; // Para el botón "Inspeccionar"
}

const DriverVehicleCard: React.FC<DriverVehicleCardProps> = ({
  vehicle,
  onDelete,
  onInspect,
}) => {
  return (
    <Card className={styles.vehicleCardContainer}>
      <div className={styles.vehicleVisual}>
        {/* Si tienes imageUrl:
        <img
          src={vehicle.imageUrl || defaultVehicleImage}
          alt={`${vehicle.brand} ${vehicle.category}`}
          className={styles.vehicleImage}
        />
        Sino, puedes mostrar un icono o un placeholder: */}
        <div className={styles.vehicleImagePlaceholder}>
          <span>{vehicle.category.charAt(0).toUpperCase()}</span>
        </div>
      </div>
      <div className={styles.vehicleDetails}>
        <h3 className={styles.vehicleCategory}>{vehicle.category}</h3>
        <p className={styles.vehicleBrand}>{vehicle.brand}</p>
      </div>
      <div className={styles.actions}>
        {onInspect && (
          <Button
            onClick={() => onInspect(vehicle.id)}
            variant="secondary"
            size="small"
          >
            Inspeccionar
          </Button>
        )}
        <Button
          onClick={() => onDelete(vehicle.id)}
          variant="danger"
          size="small"
        >
          Eliminar
        </Button>
      </div>
    </Card>
  );
};

export default DriverVehicleCard;
