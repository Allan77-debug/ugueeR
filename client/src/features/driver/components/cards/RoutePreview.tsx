// client/src/features/driver/components/cards/RoutePreview.tsx

import React, { useEffect, useState } from "react";
import { Polyline, DirectionsRenderer } from "@react-google-maps/api";
import { LatLngTuple } from "../../../../types/driver.types";
import axios from "axios";

interface RoutePreviewProps {
  start: LatLngTuple;
  end: LatLngTuple;
}

const RoutePreview: React.FC<RoutePreviewProps> = ({ start, end }) => {
  const [routePath, setRoutePath] = useState<google.maps.LatLng[]>([]);
  const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);
  const [useBackendRoute, setUseBackendRoute] = useState(true);

  useEffect(() => {
    const startPoint = { lat: start[0], lng: start[1] };
    const endPoint = { lat: end[0], lng: end[1] };

    // Intentar primero con la API del backend
    axios.get(`http://localhost:8000/api/driver/route-directions/`, {
      params: {
        start: `${start[0]},${start[1]}`,
        end: `${end[0]},${end[1]}`
      }
    })
    .then((response) => {
      const data = response.data;
      const encoded = data.routes?.[0]?.overview_polyline?.points;
      if (encoded && window.google) {
        console.log("RoutePreview: Ruta obtenida del backend, dibujando polilínea.");
        const decodedPath = window.google.maps.geometry.encoding.decodePath(encoded);
        setRoutePath(decodedPath);
        setUseBackendRoute(true);
      } else {
        throw new Error("No se encontró la polilínea en la respuesta del backend");
      }
    })
    .catch((error) => {
      console.warn("Error con la API del backend en RoutePreview, usando Google Maps:", error);
      
      // Fallback a Google Maps Directions API
      if (window.google) {
        const directionsService = new window.google.maps.DirectionsService();
        
        directionsService.route(
          {
            origin: startPoint,
            destination: endPoint,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === "OK" && result) {
              setDirectionsResult(result);
              setUseBackendRoute(false);
            } else {
              console.warn("No se pudo obtener la ruta de Google Maps en RoutePreview:", status);
            }
          }
        );
      }
    });
  }, [start, end]);

  // Mostrar la ruta del backend si está disponible
  if (useBackendRoute && routePath.length > 0) {
    return (
      <Polyline
        path={routePath}
        options={{ 
          strokeColor: "#6a5acd", 
          strokeWeight: 4,
          strokeOpacity: 0.8,
          zIndex: 1 
        }}
      />
    );
  }

  // Mostrar la ruta de Google Maps si el backend falló
  if (!useBackendRoute && directionsResult) {
    return (
      <DirectionsRenderer
        directions={directionsResult}
        options={{
          suppressMarkers: true, // Los marcadores se muestran por separado
          polylineOptions: {
            strokeColor: "#6a5acd",
            strokeWeight: 4,
            strokeOpacity: 0.8,
          },
        }}
      />
    );
  }

  return null;
};

export default RoutePreview;
