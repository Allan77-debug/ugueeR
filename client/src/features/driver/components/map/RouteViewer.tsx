

// client/src/features/driver/components/map/RouteViewer.tsx

import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  MarkerF,
  DirectionsRenderer,
  Polyline,
} from "@react-google-maps/api";
import { LatLngTuple } from "../../../../types/driver.types";
import axios from "axios";

// Reciben como propiedades (props) externas
interface RouteViewerProps {
  startPointCoords: LatLngTuple;
  endPointCoords: LatLngTuple;
}

const RouteViewer: React.FC<RouteViewerProps> = ({
  startPointCoords,
  endPointCoords,
}) => {
  const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);
  const [routePath, setRoutePath] = useState<google.maps.LatLng[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [useBackendRoute, setUseBackendRoute] = useState(true);
  const mapRef = useRef<google.maps.Map | null>(null);

  const startPoint = { lat: startPointCoords[0], lng: startPointCoords[1] };
  const endPoint = { lat: endPointCoords[0], lng: endPointCoords[1] };

  // Cargar la ruta usando la API del backend primero, si falla usar Google Maps
  useEffect(() => {
    if (startPoint && endPoint) {
      setIsLoadingRoute(true);
      
      // Intentar primero con la API del backend
      axios.get(`http://localhost:8000/api/driver/route-directions/`, {
        params: {
          start: `${startPointCoords[0]},${startPointCoords[1]}`,
          end: `${endPointCoords[0]},${endPointCoords[1]}`
        }
      })
      .then((response) => {
        const data = response.data;
        const encoded = data.routes?.[0]?.overview_polyline?.points;
        if (encoded && window.google) {
          console.log("RouteViewer: Ruta obtenida del backend, dibujando polilínea.");
          const decodedPath = window.google.maps.geometry.encoding.decodePath(encoded);
          setRoutePath(decodedPath);
          setUseBackendRoute(true);
        } else {
          throw new Error("No se encontró la polilínea en la respuesta del backend");
        }
        setIsLoadingRoute(false);
      })
      .catch((error) => {
        console.warn("Error con la API del backend, usando Google Maps Directions:", error);
        
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
              setIsLoadingRoute(false);
              if (status === "OK" && result) {
                setDirectionsResult(result);
                setUseBackendRoute(false);
              } else {
                console.warn("No se pudo obtener la ruta de Google Maps:", status);
              }
            }
          );
        }
      });
    }
  }, [startPointCoords, endPointCoords]);

  return (
    <div style={{ width: "100%", height: "400px" }}>
      {isLoadingRoute && (
        <div style={{ padding: "20px", textAlign: "center" }}>
          Cargando ruta...
        </div>
      )}
      
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={startPoint}
        zoom={12}
        onLoad={(map) => {
          mapRef.current = map;
          
          // Ajustar la vista para mostrar ambos puntos
          if (startPoint && endPoint) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(startPoint);
            bounds.extend(endPoint);
            map.fitBounds(bounds, 50);
          }
        }}
        options={{
          mapTypeControl: true,
          streetViewControl: true,
          zoomControl: true,
          fullscreenControl: true,
        }}
      >
        {/* Mostrar marcadores siempre */}
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
        
        {/* Mostrar la ruta del backend si está disponible */}
        {useBackendRoute && routePath.length > 0 && (
          <Polyline
            path={routePath}
            options={{ 
              strokeColor: "#6a5acd", 
              strokeWeight: 5,
              strokeOpacity: 0.8,
              zIndex: 1
            }}
          />
        )}
        
        {/* Mostrar la ruta de Google Maps si el backend falló */}
        {!useBackendRoute && directionsResult && (
          <DirectionsRenderer
            directions={directionsResult}
            options={{
              suppressMarkers: true, // Usamos nuestros propios marcadores
              polylineOptions: {
                strokeColor: "#6a5acd",
                strokeWeight: 5,
                strokeOpacity: 0.8,
              },
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default RouteViewer;
