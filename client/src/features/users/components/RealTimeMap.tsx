import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import styles from './RealTimeMap.module.css';

const containerStyle = {
  width: '100%',
  height: '600px'
};

// Coordenadas de ejemplo (Cali, Colombia)
const defaultCenter = {
  lat: 3.4516,
  lng: -76.5320
};

// Simulación de vehículos en tiempo real
interface Vehicle {
  id: number;
  position: { lat: number; lng: number };
  driver: string;
  plate: string;
  available: boolean;
  vehicleType: string;
}

const RealTimeMap: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Simular vehículos en movimiento
  useEffect(() => {
    const initialVehicles: Vehicle[] = [
      {
        id: 1,
        position: { lat: 3.4516, lng: -76.5320 },
        driver: "Carlos Rodríguez",
        plate: "ABC123",
        available: true,
        vehicleType: "Sedan"
      },
      {
        id: 2,
        position: { lat: 3.4600, lng: -76.5250 },
        driver: "Ana Martínez",
        plate: "XYZ789",
        available: false,
        vehicleType: "SUV"
      },
      {
        id: 3,
        position: { lat: 3.4450, lng: -76.5400 },
        driver: "Luis Gómez",
        plate: "DEF456",
        available: true,
        vehicleType: "Hatchback"
      },
      {
        id: 4,
        position: { lat: 3.4580, lng: -76.5180 },
        driver: "María López",
        plate: "GHI789",
        available: true,
        vehicleType: "Sedan"
      },
      {
        id: 5,
        position: { lat: 3.4480, lng: -76.5380 },
        driver: "Pedro Sánchez",
        plate: "JKL012",
        available: false,
        vehicleType: "SUV"
      }
    ];

    console.log("Cargando vehículos:", initialVehicles);
    setVehicles(initialVehicles);

    // Simular movimiento de vehículos cada 5 segundos
    const interval = setInterval(() => {
      setVehicles(prevVehicles => {
        const updatedVehicles = prevVehicles.map(vehicle => ({
          ...vehicle,
          position: {
            lat: vehicle.position.lat + (Math.random() - 0.5) * 0.002,
            lng: vehicle.position.lng + (Math.random() - 0.5) * 0.002
          }
        }));
        console.log("Actualizando vehículos:", updatedVehicles);
        return updatedVehicles;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getMarkerIcon = (vehicle: Vehicle) => {
    const color = vehicle.available ? '#22c55e' : '#ef4444'; // Verde si disponible, rojo si no
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.8,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 8
    };
  };

  if (!isLoaded) {
    return (
      <div className={styles.mapLoading}>
        <div className={styles.mapLoadingContent}>
          <div className={styles.spinner}></div>
          <p>Cargando mapa...</p>
        </div>
      </div>
    );
  }

  console.log("Renderizando mapa con", vehicles.length, "vehículos");
  console.log("Disponibles:", vehicles.filter(v => v.available).length);
  console.log("Ocupados:", vehicles.filter(v => !v.available).length);

  return (
    <div className={styles.mapWrapper}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={13}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true
        }}
      >
        {vehicles.map((vehicle) => (
          <MarkerF
            key={vehicle.id}
            position={vehicle.position}
            icon={getMarkerIcon(vehicle)}
            title={`${vehicle.driver} - ${vehicle.plate} (${vehicle.available ? 'Disponible' : 'No disponible'})`}
          />
        ))}
      </GoogleMap>
      
      {/* Leyenda */}
      <div className={styles.mapLegend} style={{ backgroundColor: 'red', color: 'white' }}>
        <div className={styles.legendTitle}>Leyenda:</div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.available}`}></div>
          Disponible
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.unavailable}`}></div>
          No disponible
        </div>
      </div>

      {/* Info de vehículos */}
      <div className={styles.mapInfo} style={{ backgroundColor: 'blue', color: 'white' }}>
        <div className={styles.infoTitle}>
          Vehículos activos: {vehicles.length}
        </div>
        <div className={styles.infoAvailable}>
          Disponibles: {vehicles.filter(v => v.available).length}
        </div>
        <div className={styles.infoOccupied}>
          Ocupados: {vehicles.filter(v => !v.available).length}
        </div>
      </div>
    </div>
  );
};

export default RealTimeMap;
