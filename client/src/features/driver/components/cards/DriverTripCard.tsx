import React from "react";
// Rutas de importación ajustadas:
import { DriverTrip } from "../../../../types/driver.types";
import Button from "../common/Button";
import Card from "../common/Card";
import { MapPin, CalendarDays, Tag, Users, Car } from "lucide-react"; // Iconos relevantes
import styles from "./DriverTripCard.module.css";

interface DriverTripCardProps {
  trip: DriverTrip;
  onDelete: (id: number) => void;
  // onEdit?: (id: string) => void;
}

const DriverTripCard: React.FC<DriverTripCardProps> = ({
  trip,
  onDelete /*, onEdit */,
}) => {
  const formatDate = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <Card className={styles.tripCardContainer}>
      <div className={styles.tripRoute}>
        <div className={styles.location}>
          <MapPin size={16} className={styles.icon} />
          <span>{trip.startLocation}</span>
        </div>
        <span className={styles.arrow}>→</span>
        <div className={styles.location}>
          <MapPin size={16} className={styles.icon} />
          <span>{trip.destination}</span>
        </div>
      </div>

      <div className={styles.tripDetailsGrid}>
        <div className={styles.detailItem}>
          <Car size={16} className={styles.icon} />
          <span>{trip.vehicleType}</span>
        </div>
        <div className={styles.detailItem}>
          <Tag size={16} className={styles.icon} />
          <span>${trip.price.toLocaleString("es-CO")}</span>
        </div>
        <div className={styles.detailItem}>
          <CalendarDays size={16} className={styles.icon} />
          <span>
            {formatDate(trip.departureDateTime)} -{" "}
            {formatTime(trip.departureDateTime)}
          </span>
        </div>
        <div className={styles.detailItem}>
          <Users size={16} className={styles.icon} />
          <span>{trip.availableSeats} sillas disponibles</span>
        </div>
      </div>

      <div className={styles.actions}>
        {/* {onEdit && (
          <Button onClick={() => onEdit(trip.id)} variant="secondary" size="small">
            Editar
          </Button>
        )} */}
        <Button onClick={() => onDelete(trip.id)} variant="danger" size="small">
          Eliminar
        </Button>
      </div>
    </Card>
  );
};

export default DriverTripCard;
