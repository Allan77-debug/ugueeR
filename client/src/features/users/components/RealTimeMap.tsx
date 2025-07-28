import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, Polyline } from '@react-google-maps/api';
import authService from '../../../services/authService';
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

// Interface para los datos del WebSocket
interface WebSocketLocationData {
  travel_id: number;
  driver_name: string;
  lat: number;
  lon: number;
  speed?: number;
}

// Interface actualizada para vehículos en tiempo real
interface Vehicle {
  id: number;
  travel_id: number;
  position: { lat: number; lng: number };
  driver: string;
  plate: string;
  available: boolean;
  vehicleType: string;
  destination: string;
  rating: number;
  estimatedTime: string;
  speed?: number;
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
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  // Función para conectar al WebSocket
  const connectToWebSocket = () => {
    const token = authService.getToken();
    
    if (!token) {
      console.error('No se encontró token de usuario para conectar al WebSocket');
      setConnectionStatus('error');
      return;
    }

    // Cerrar conexión existente si existe
    if (socket) {
      socket.close();
    }

    const websocketUrl = `ws://localhost:8000/ws/institution/live_map/?token=${token}`;
    console.log('Conectando al WebSocket:', websocketUrl);
    
    setConnectionStatus('connecting');
    const newSocket = new WebSocket(websocketUrl);

    newSocket.onopen = () => {
      console.log('✅ Conectado al WebSocket del mapa institucional');
      setConnectionStatus('connected');
    };

    newSocket.onmessage = (event) => {
      try {
        const data: WebSocketLocationData = JSON.parse(event.data);
        
        // Manejo de errores del servidor
        if ((data as any).error) {
          console.error('Error desde el servidor:', (data as any).error);
          return;
        }

        const { travel_id, driver_name, lat, lon, speed } = data;
        console.log(`📍 Viaje ${travel_id} (${driver_name}) -> Lat: ${lat}, Lon: ${lon}`);

        // Actualizar o agregar vehículo
        setVehicles(prevVehicles => {
          const existingVehicleIndex = prevVehicles.findIndex(v => v.travel_id === travel_id);
          
          if (existingVehicleIndex !== -1) {
            // Actualizar vehículo existente
            const updatedVehicles = [...prevVehicles];
            updatedVehicles[existingVehicleIndex] = {
              ...updatedVehicles[existingVehicleIndex],
              position: { lat, lng: lon },
              speed,
              driver: driver_name
            };
            return updatedVehicles;
          } else {
            // Agregar nuevo vehículo
            const newVehicle: Vehicle = {
              id: travel_id,
              travel_id,
              position: { lat, lng: lon },
              driver: driver_name,
              plate: `VEH-${travel_id}`, // Placeholder, podrías obtener esto de otra API
              available: true,
              vehicleType: "Sedan", // Placeholder
              destination: "Destino", // Placeholder
              rating: 4.5, // Placeholder
              estimatedTime: "En tiempo real",
              speed
            };
            return [...prevVehicles, newVehicle];
          }
        });

      } catch (error) {
        console.error('Error procesando mensaje del WebSocket:', error);
        console.log('Dato recibido:', event.data);
      }
    };

    newSocket.onclose = (event) => {
      const reason = event.reason ? `, Razón: ${event.reason}` : '';
      console.log(`❌ WebSocket desconectado. Código: ${event.code}${reason}`);
      setConnectionStatus('disconnected');
      
      // Intentar reconectar después de 5 segundos
      setTimeout(() => {
        console.log('Intentando reconectar...');
        connectToWebSocket();
      }, 5000);
    };

    newSocket.onerror = (error) => {
      console.error('🔥 Error en la conexión WebSocket:', error);
      setConnectionStatus('error');
    };

    setSocket(newSocket);
  };

  // Conectar al WebSocket cuando el componente se monta
  useEffect(() => {
    connectToWebSocket();

    // Cleanup: cerrar conexión cuando el componente se desmonta
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  // Datos de fallback por si no hay conexión WebSocket (COMENTADO)
  /*
  useEffect(() => {
    // Solo cargar datos simulados si no hay conexión WebSocket activa
    if (connectionStatus === 'error' || connectionStatus === 'disconnected') {
      const fallbackVehicles: Vehicle[] = [
        {
          id: 1,
          travel_id: 1,
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
          travel_id: 2,
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
          travel_id: 3,
          position: { lat: 3.4450, lng: -76.5400 },
          driver: "Luis Gómez",
          plate: "DEF456",
          available: true,
          vehicleType: "Hatchback",
          destination: "Estación MIO Universidades",
          rating: 4.9,
          estimatedTime: "8 min"
        }
      ];

      console.log("Cargando vehículos de fallback (sin WebSocket):", fallbackVehicles);
      setVehicles(fallbackVehicles);
    }
  }, [connectionStatus]);
  */

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
                    {selectedVehicle.speed !== undefined && (
                      <p><strong>Velocidad:</strong> {selectedVehicle.speed} km/h</p>
                    )}
                    {connectionStatus === 'connected' && (
                      <p style={{ color: '#22c55e', fontSize: '11px', fontStyle: 'italic' }}>
                        📍 Ubicación en tiempo real
                      </p>
                    )}
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

      {/* Estado de conexión WebSocket */}
      <div className={styles.connectionStatus}>
        <div className={styles.connectionTitle}>Estado de conexión:</div>
        <div className={`${styles.connectionIndicator} ${styles[connectionStatus]}`}>
          <div className={styles.connectionDot}></div>
          {connectionStatus === 'connected' && 'Conectado - Tiempo Real'}
          {connectionStatus === 'connecting' && 'Conectando...'}
          {connectionStatus === 'disconnected' && 'Desconectado'}
          {connectionStatus === 'error' && 'Error de conexión'}
        </div>
        {connectionStatus !== 'connected' && (
          <div className={styles.connectionNote}>
            Mostrando datos de prueba
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeMap;
