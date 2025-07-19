// client/src/features/driver/components/map/MapView.tsx (SIMPLIFICADO)

import React, { useState, useEffect, useCallback } from "react";
import {
  GoogleMap,
  MarkerF,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import { LatLngTuple } from "../../../../types/driver.types";
import Button from "../common/Button";
import styles from "./MapView.module.css";
import { MapPin } from "lucide-react";

const LIBRARIES: "geometry"[] = ["geometry"];
const defaultCenter = { lat: 3.376, lng: -76.535 };

type SelectionMode = "start" | "end" | null;

interface MapViewProps {
  onAccept: (
    start: LatLngTuple,
    end: LatLngTuple,
    startName: string,
    endName: string
  ) => void;
  onCancel: () => void;
}

const MapView: React.FC<MapViewProps> = ({ onAccept, onCancel }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const [startPoint, setStartPoint] = useState<google.maps.LatLng | null>(null);
  const [endPoint, setEndPoint] = useState<google.maps.LatLng | null>(null);
  const [startName, setStartName] = useState("");
  const [endName, setEndName] = useState("");
  const [routePath, setRoutePath] = useState<google.maps.LatLng[]>([]);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);

  const getAddressFromCoords = useCallback(
    async (latLng: google.maps.LatLng): Promise<string> => {
      try {
        const response = await fetch(
          `/api/driver/reverse-geocode/?latlng=${latLng.lat()},${latLng.lng()}`
        );
        const data = await response.json();
        return data.results?.[0]?.formatted_address || "Ubicación sin nombre";
      } catch (error) {
        return "Ubicación desconocida";
      }
    },
    []
  );

  const handleMapClick = useCallback(
    async (e: google.maps.MapMouseEvent) => {
      if (!selectionMode || !e.latLng) return;
      if (selectionMode === "start") {
        setStartPoint(e.latLng);
        setStartName(await getAddressFromCoords(e.latLng));
      } else {
        setEndPoint(e.latLng);
        setEndName(await getAddressFromCoords(e.latLng));
      }
      setSelectionMode(null);
    },
    [selectionMode, getAddressFromCoords]
  );

  useEffect(() => {
    if (!startPoint || !endPoint) {
      setRoutePath([]);
      return;
    }
    const startStr = `${startPoint.lat()},${startPoint.lng()}`;
    const endStr = `${endPoint.lat()},${endPoint.lng()}`;
    fetch(`/api/driver/route-directions/?start=${startStr}&end=${endStr}`)
      .then((res) => res.json())
      .then((data) => {
        const encoded = data.routes?.[0]?.overview_polyline?.points;
        setRoutePath(
          encoded
            ? window.google.maps.geometry.encoding.decodePath(encoded)
            : []
        );
      });
  }, [startPoint, endPoint]);

  const handleAccept = () => {
    if (startPoint && endPoint && startName && endName) {
      onAccept(
        [startPoint.lat(), startPoint.lng()],
        [endPoint.lat(), endPoint.lng()],
        startName,
        endName
      );
    }
  };

  if (loadError) return <div>Error al cargar el mapa.</div>;
  if (!isLoaded) return <div>Cargando Mapa...</div>;

  return (
    <div className={styles.mapViewContainer}>
      <GoogleMap
        mapContainerClassName={styles.mapElement}
        center={defaultCenter}
        zoom={12}
        onClick={handleMapClick}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          draggableCursor: selectionMode ? "crosshair" : "grab",
        }}
      >
        {startPoint && (
          <MarkerF
            position={startPoint}
            icon={{
              url: "/usuario.png",
              scaledSize: new window.google.maps.Size(35, 35),
            }}
          />
        )}
        {endPoint && (
          <MarkerF
            position={endPoint}
            icon={{
              url: "/marcador.png",
              scaledSize: new window.google.maps.Size(35, 35),
            }}
          />
        )}
        <Polyline
          path={routePath}
          options={{ strokeColor: "#6a5acd", strokeWeight: 5 }}
        />
      </GoogleMap>

      <div className={styles.mapActions}>
        <div className={styles.selectionControls}>
          <Button
            onClick={() => setSelectionMode("start")}
            variant={selectionMode === "start" ? "primary" : "secondary"}
            leftIcon={<MapPin size={16} />}
          >
            {startPoint ? "Cambiar Origen" : "Elegir Origen"}
          </Button>
          <Button
            onClick={() => setSelectionMode("end")}
            variant={selectionMode === "end" ? "primary" : "secondary"}
            leftIcon={<MapPin size={16} />}
          >
            {endPoint ? "Cambiar Destino" : "Elegir Destino"}
          </Button>
        </div>
        <div className={styles.locationInfo}>
          <p>
            <strong>Origen:</strong> {startName || "No seleccionado"}
          </p>
          <p>
            <strong>Destino:</strong> {endName || "No seleccionado"}
          </p>
        </div>
        <div className={styles.confirmationControls}>
          <Button onClick={onCancel} variant="default">
            Cancelar
          </Button>
          <Button
            onClick={handleAccept}
            variant="primary"
            disabled={!startPoint || !endPoint}
          >
            Aceptar Ruta
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MapView;
