import React, { useRef, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Polyline, Region } from "react-native-maps";
import RouteMarker from "../atoms/RouteMarker";
import MapViewDirections from "react-native-maps-directions";

type Coordinate = {
  latitude: number;
  longitude: number;
};

type Route = {
  id: string;
  startLocation: string;
  destination: string;
  startPointCoords: number[];
  endPointCoords: number[];
  stops: Coordinate[];
};

interface RoutePreviewProps {
  route: Route;
  height?: number;
}

const RoutePreview: React.FC<RoutePreviewProps> = ({ route, height = 150 }) => {
  const mapRef = useRef<MapView>(null);

  // Calcular la región que incluya origen y destino
  const calculateRegion = (): Region => {
    const { startPointCoords, endPointCoords } = route;

    const minLat = Math.min(startPointCoords[0], endPointCoords[0]);
    const maxLat = Math.max(startPointCoords[0], endPointCoords[0]);
    const minLng = Math.min(startPointCoords[1], endPointCoords[1]);
    const maxLng = Math.max(startPointCoords[1], endPointCoords[1]);

    const latDelta = Math.max(maxLat - minLat, 0.01) * 1.5;
    const lngDelta = Math.max(maxLng - minLng, 0.01) * 1.5;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  };

  useEffect(() => {
    if (mapRef.current) {
      // Ajustar la vista para mostrar toda la ruta
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(
          [
            {
              latitude: route.startPointCoords[0],
              longitude: route.startPointCoords[1],
            },
            {
              latitude: route.endPointCoords[0],
              longitude: route.endPointCoords[1],
            },
          ],
          {
            edgePadding: { top: 20, right: 20, bottom: 20, left: 20 },
            animated: true,
          }
        );
      }, 100);
    }
  }, [route]);

  const routeCoordinates = [
    {
      latitude: route.startPointCoords[0],
      longitude: route.startPointCoords[1],
    },
    { latitude: route.endPointCoords[0], longitude: route.endPointCoords[1] },
  ];

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={calculateRegion()}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        <MapViewDirections
          origin={{
            latitude: route.startPointCoords[0],
            longitude: route.startPointCoords[1],
          }}
          destination={{
            latitude: route.endPointCoords[0],
            longitude: route.endPointCoords[1],
          }}
          apikey={"AIzaSyDUp7c8CKBWwMFkqaONDnwgiI7irj6G6Nw"}
          strokeWidth={3}
          strokeColor="hotpink"
        />
        <RouteMarker
          coordinate={{
            latitude: route.startPointCoords[0],
            longitude: route.startPointCoords[1],
          }}
          title="Origen"
          pinColor="green"
          description="Punto de partida"
        />

        <RouteMarker
          coordinate={{
            latitude: route.endPointCoords[0],
            longitude: route.endPointCoords[1],
          }}
          title="Destino"
          pinColor="red"
          description="Punto de llegada"
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
  },
  map: {
    flex: 1,
  },
});

export default RoutePreview;
