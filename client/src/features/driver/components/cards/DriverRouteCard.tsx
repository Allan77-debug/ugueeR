import React from "react";
import {
  GoogleMap,
  MarkerF,
} from "@react-google-maps/api";
import { DriverRoute } from "../../../../types/driver.types";
import Button from "../common/Button";
import Card from "../common/Card";
import styles from "./DriverRouteCard.module.css";
import { MapPin, Maximize2 } from "lucide-react";
import RoutePreview from "./RoutePreview";

interface DriverRouteCardProps {
  route: DriverRoute;
  onDelete: (id: number) => void;
  onShowMap: (route: DriverRoute) => void;
  isLoaded: boolean;
  loadError: Error | undefined;
}

const DriverRouteCard: React.FC<DriverRouteCardProps> = ({
  route,
  onDelete,
  onShowMap,
  isLoaded,
  loadError,
}) => {
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
          {loadError && <div>Error al cargar mapa.</div>}
          {!isLoaded && <div>Cargando mapa...</div>}
          {isLoaded && (
            <GoogleMap
              mapContainerClassName={styles.mapElement}
              center={startMarkerPos || { lat: 0, lng: 0 }}
              zoom={12}
              options={{ 
                disableDefaultUI: true, 
                gestureHandling: "none",
                zoomControl: false,
                mapTypeControl: false,
                scaleControl: false,
                streetViewControl: false,
                rotateControl: false,
                fullscreenControl: false
              }}
              onLoad={(map) => {
                if (startMarkerPos && endMarkerPos) {
                  const bounds = new window.google.maps.LatLngBounds();
                  bounds.extend(startMarkerPos);
                  bounds.extend(endMarkerPos);
                  map.fitBounds(bounds, 40);
                }
              }}
            >
              {/* Mostrar marcadores */}
              {startMarkerPos && (
                <MarkerF
                  position={startMarkerPos}
                  icon={{
                    url: "/usuario.png",
                    scaledSize: new window.google.maps.Size(25, 25),
                  }}
                />
              )}
              {endMarkerPos && (
                <MarkerF
                  position={endMarkerPos}
                  icon={{
                    url: "/marcador.png",
                    scaledSize: new window.google.maps.Size(25, 25),
                  }}
                />
              )}
              
              {/* Mostrar la ruta usando RoutePreview */}
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