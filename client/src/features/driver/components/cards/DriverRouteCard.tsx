// client/src/features/driver/components/cards/DriverRouteCard.tsx (CÓDIGO FINAL Y REFORZADO)

import React from "react";
import {
  GoogleMap,
  MarkerF,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import { DriverRoute } from "../../../../types/driver.types";
import Button from "../common/Button";
import Card from "../common/Card";
import styles from "./DriverRouteCard.module.css";
import { MapPin, Maximize2 } from "lucide-react";
import RoutePreview from "./RoutePreview"; // Asegúrate de que este archivo exista

const LIBRARIES: "geometry"[] = ["geometry"];

interface DriverRouteCardProps {
  route: DriverRoute;
  onDelete: (id: number) => void;
  onShowMap: (route: DriverRoute) => void;
}

const DriverRouteCard: React.FC<DriverRouteCardProps> = ({
  route,
  onDelete,
  onShowMap,
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const canDisplayMiniMap = route.startPointCoords && route.endPointCoords;
  const startMarkerPos = canDisplayMiniMap
    ? { lat: route.startPointCoords![0], lng: route.startPointCoords![1] }
    : null;
  const endMarkerPos = canDisplayMiniMap
    ? { lat: route.endPointCoords![0], lng: route.endPointCoords![1] }
    : null;

  return (
    <Card className={styles.routeCardContainer}>
      <div className={styles.routeHeader}>
        {/* ... (código del header sin cambios) ... */}
        <div className={styles.routeInfo}>
          <span className={styles.locationPoint} title={route.startLocation}>
            {route.startLocation}
          </span>
          <span className={styles.arrow}>→</span>
          <span className={styles.locationPoint} title={route.destination}>
            {route.destination}
          </span>
        </div>
        <Button
          onClick={() => onShowMap(route)}
          variant="default"
          size="small"
          className={styles.maximizeButton}
        >
          <Maximize2 size={16} />
        </Button>
      </div>

      {canDisplayMiniMap ? (
        <div className={styles.miniMapContainer}>
          {loadError && <div>Error al cargar.</div>}
          {!isLoaded && <div>Cargando...</div>}
          {isLoaded && (
            <GoogleMap
              mapContainerClassName={styles.mapElement}
              center={startMarkerPos || { lat: 0, lng: 0 }}
              zoom={12}
              options={{ disableDefaultUI: true, gestureHandling: "none" }}
              onLoad={(map) => {
                if (startMarkerPos && endMarkerPos) {
                  const bounds = new window.google.maps.LatLngBounds();
                  bounds.extend(startMarkerPos);
                  bounds.extend(endMarkerPos);
                  map.fitBounds(bounds, 40);
                }
              }}
            >
              {startMarkerPos && (
                <MarkerF
                  position={startMarkerPos}
                  icon={{
                    url: "/usuario.png", // <- Tu imagen para el inicio
                    scaledSize: new window.google.maps.Size(25, 25), // <- Tamaño para el mapa pequeño
                  }}
                />
              )}
              {endMarkerPos && (
                <MarkerF
                  position={endMarkerPos}
                  icon={{
                    url: "/marcador.png", // <- Tu imagen para el destino
                    scaledSize: new window.google.maps.Size(25, 25), // <- Tamaño para el mapa pequeño
                  }}
                />
              )}
              <RoutePreview
                start={route.startPointCoords!}
                end={route.endPointCoords!}
              />
            </GoogleMap>
          )}
        </div>
      ) : (
        <div className={styles.mapPlaceholder} onClick={() => onShowMap(route)}>
          <MapPin size={30} />
          <p>Ver ruta en mapa</p>
        </div>
      )}

      <div className={styles.footerInfo}>
        {/* ... (código del footer sin cambios) ... */}
        <div className={styles.actions}>
          <Button
            onClick={() => onDelete(route.id)}
            variant="danger"
            size="small"
          >
            Eliminar
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DriverRouteCard;
