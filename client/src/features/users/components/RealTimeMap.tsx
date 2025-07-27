import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, Polyline } from '@react-google-maps/api';
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
  destination: string;
  rating: number;
  estimatedTime: string;
}

const RealTimeMap: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showRoute, setShowRoute] = useState<boolean>(false);
  const [routePath, setRoutePath] = useState<google.maps.LatLng[]>([]);

  // Simular vehículos en movimiento
  useEffect(() => {
    const initialVehicles: Vehicle[] = [
      {
        id: 1,
        position: { lat: 3.4516, lng: -76.5320 },
        driver: "Carlos Rodríguez",
        plate: "ABC123",
        available: true,
        vehicleType: "Sedan",
        destination: "Terminal de Transporte",
        rating: 4.8,
        estimatedTime: "5 min"
      },
      {
        id: 2,
        position: { lat: 3.4600, lng: -76.5250 },
        driver: "Ana Martínez",
        plate: "XYZ789",
        available: false,
        vehicleType: "SUV",
        destination: "Centro Comercial Chipichape",
        rating: 4.5,
        estimatedTime: "En viaje"
      },
      {
        id: 3,
        position: { lat: 3.4450, lng: -76.5400 },
        driver: "Luis Gómez",
        plate: "DEF456",
        available: true,
        vehicleType: "Hatchback",
        destination: "Estación MIO Universidades",
        rating: 4.9,
        estimatedTime: "8 min"
      },
      {
        id: 4,
        position: { lat: 3.4580, lng: -76.5180 },
        driver: "María López",
        plate: "GHI789",
        available: true,
        vehicleType: "Sedan",
        destination: "Parque del Perro",
        rating: 4.7,
        estimatedTime: "3 min"
      },
      {
        id: 5,
        position: { lat: 3.4480, lng: -76.5380 },
        driver: "Pedro Sánchez",
        plate: "JKL012",
        available: false,
        vehicleType: "SUV",
        destination: "Ciudad Jardín",
        rating: 4.6,
        estimatedTime: "En viaje"
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

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleClosePopup = () => {
    setSelectedVehicle(null);
    setShowRoute(false);
    setRoutePath([]);
  };

  const handleViewRoute = async (vehicle: Vehicle) => {
    setShowRoute(true);
    
    // Simular una ruta desde la posición del vehículo hasta su destino
    // En una implementación real, esto vendría de una API
    const mockDestination = {
      lat: vehicle.position.lat + (Math.random() - 0.5) * 0.01,
      lng: vehicle.position.lng + (Math.random() - 0.5) * 0.01
    };

    // Crear una ruta simulada con algunos puntos intermedios
    const simulatedRoute = [
      new google.maps.LatLng(vehicle.position.lat, vehicle.position.lng),
      new google.maps.LatLng(
        vehicle.position.lat + (mockDestination.lat - vehicle.position.lat) * 0.3,
        vehicle.position.lng + (mockDestination.lng - vehicle.position.lng) * 0.3
      ),
      new google.maps.LatLng(
        vehicle.position.lat + (mockDestination.lat - vehicle.position.lat) * 0.7,
        vehicle.position.lng + (mockDestination.lng - vehicle.position.lng) * 0.7
      ),
      new google.maps.LatLng(mockDestination.lat, mockDestination.lng)
    ];

    setRoutePath(simulatedRoute);
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
            title={`${vehicle.driver} - ${vehicle.plate}`}
            onClick={() => handleVehicleClick(vehicle)}
          >
            {selectedVehicle && selectedVehicle.id === vehicle.id && (
              <InfoWindowF
                onCloseClick={handleClosePopup}
                options={{
                  pixelOffset: new google.maps.Size(0, -10)
                }}
              >
                <div className={styles.infoWindow}>
                  <div className={styles.infoWindowHeader}>
                    <h4>{selectedVehicle.driver}</h4>
                    <span className={`${styles.status} ${selectedVehicle.available ? styles.available : styles.unavailable}`}>
                      {selectedVehicle.available ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                  <div className={styles.infoWindowBody}>
                    <p><strong>Placa:</strong> {selectedVehicle.plate}</p>
                    <p><strong>Destino:</strong> {selectedVehicle.destination}</p>
                    <p><strong>Tipo:</strong> {selectedVehicle.vehicleType}</p>
                    <p><strong>Tiempo:</strong> {selectedVehicle.estimatedTime}</p>
                  </div>
                  <div className={styles.infoWindowActions}>
                    <button 
                      className={styles.routeButton}
                      onClick={() => handleViewRoute(selectedVehicle)}
                      disabled={showRoute}
                    >
                      {showRoute ? 'Ruta mostrada' : 'Ver Ruta'}
                    </button>
                  </div>
                </div>
              </InfoWindowF>
            )}
          </MarkerF>
        ))}
        
        {/* Mostrar la ruta si está activa */}
        {showRoute && routePath.length > 0 && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: '#3b82f6',
              strokeOpacity: 0.8,
              strokeWeight: 4,
              geodesic: true,
            }}
          />
        )}
      </GoogleMap>
      
      {/* Leyenda */}
      <div className={styles.mapLegend}>
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
      <div className={styles.mapInfo}>
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
