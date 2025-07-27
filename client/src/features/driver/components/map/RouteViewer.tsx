// client/src/features/driver/components/map/RouteViewer.tsx (NUEVO ARCHIVO)

import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  MarkerF,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import { LatLngTuple } from "../../../../types/driver.types";

const LIBRARIES: "geometry"[] = ["geometry"];

// Reciben como propiedades (props) externas
interface RouteViewerProps {
  startPointCoords: LatLngTuple;
  endPointCoords: LatLngTuple;
}

const RouteViewer: React.FC<RouteViewerProps> = ({
  startPointCoords,
  endPointCoords,
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const [routePath, setRoutePath] = useState<google.maps.LatLng[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);
  const hasCentered = useRef(false);

  const startPoint = { lat: startPointCoords[0], lng: startPointCoords[1] };
  const endPoint = { lat: endPointCoords[0], lng: endPointCoords[1] };

  useEffect(() => {
    fetch(
      `/api/driver/route-directions/?start=${startPointCoords.join(
        ","
      )}&end=${endPointCoords.join(",")}`
    )
      .then((res) => res.json())
      .then((data) => {
        const encoded = data.routes?.[0]?.overview_polyline?.points;
        if (encoded)
          setRoutePath(
            window.google.maps.geometry.encoding.decodePath(encoded)
          );
      });
  }, [startPointCoords, endPointCoords]);

  useEffect(() => {
    if (mapRef.current && routePath.length > 0 && !hasCentered.current) {
      const bounds = new window.google.maps.LatLngBounds();
      routePath.forEach((point) => bounds.extend(point));
      mapRef.current.fitBounds(bounds, 50);
      hasCentered.current = true;
    }
  }, [routePath]);

  if (loadError) return <div>Error al cargar el mapa.</div>;
  if (!isLoaded) return <div>Cargando Mapa...</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={startPoint}
      zoom={12}
      onLoad={(map) => {
        mapRef.current = map;
      }}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
      }}
    >
      <MarkerF
        position={startPoint}
        icon={{
          url: "/usuario.png",
          scaledSize: new window.google.maps.Size(35, 35),
        }}
      />
      <MarkerF
        position={endPoint}
        icon={{
          url: "/marcador.png",
          scaledSize: new window.google.maps.Size(35, 35),
        }}
      />
      <Polyline
        path={routePath}
        options={{ strokeColor: "#6a5acd", strokeWeight: 5 }}
      />
    </GoogleMap>
  );
};

export default RouteViewer;
