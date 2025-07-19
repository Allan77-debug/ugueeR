// client/src/features/driver/components/cards/RoutePreview.tsx

import React, { useEffect, useState } from "react";
import { Polyline } from "@react-google-maps/api";
import { LatLngTuple } from "../../../../types/driver.types";

interface RoutePreviewProps {
  start: LatLngTuple;
  end: LatLngTuple;
}

const RoutePreview: React.FC<RoutePreviewProps> = ({ start, end }) => {
  const [routePath, setRoutePath] = useState<google.maps.LatLng[]>([]);

  useEffect(() => {
    fetch(
      `/api/driver/route-directions/?start=${start.join(",")}&end=${end.join(
        ","
      )}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("La respuesta del servidor no fue OK");
        return res.json();
      })
      .then((data) => {
        const encoded = data.routes?.[0]?.overview_polyline?.points;
        if (encoded && window.google) {
          console.log("RoutePreview: Ruta obtenida, dibujando polilínea.");
          setRoutePath(
            window.google.maps.geometry.encoding.decodePath(encoded)
          );
        } else {
          console.warn(
            "RoutePreview: No se encontró la polilínea en la respuesta."
          );
        }
      })
      .catch((err) =>
        console.error("Error al obtener la ruta en RoutePreview:", err)
      );
  }, [start, end]);

  if (!routePath.length) return null;

  return (
    <Polyline
      path={routePath}
      options={{ strokeColor: "#6a5acd", strokeWeight: 5, zIndex: 1 }}
    />
  );
};

export default RoutePreview;
