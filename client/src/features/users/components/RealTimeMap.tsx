import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, Polyline, DirectionsRenderer } from '@react-google-maps/api';
import authService from '../../../services/authService';
import axios from 'axios';
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
  error?: string; // Para manejar errores del servidor
}

// Interface para los datos de ruta del backend
interface RouteData {
  id: number;
  travel_id: number;
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  origin_address: string;
  destination_address: string;
  distance: string;
  duration: string;
  waypoints: google.maps.LatLng[] | { lat: number; lng: number }[];
  encoded_polyline?: string;
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
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['geometry'] // Necesario para decodificar polilíneas
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showRoute, setShowRoute] = useState<boolean>(false);
  const [routePath, setRoutePath] = useState<google.maps.LatLng[]>([]);
  const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [useBackendRoute, setUseBackendRoute] = useState(true);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [routeMarkers, setRouteMarkers] = useState<{ origin: { lat: number; lng: number } | null; destination: { lat: number; lng: number } | null }>({
    origin: null,
    destination: null
  });

  // Función para obtener la ubicación del usuario
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          console.log("📍 Ubicación del usuario obtenida:", location);
        },
        (error) => {
          console.warn("Error obteniendo ubicación del usuario:", error);
          // Usar ubicación predeterminada de Cali si falla
          setUserLocation(defaultCenter);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos
        }
      );
    } else {
      console.warn("Geolocalización no disponible");
      setUserLocation(defaultCenter);
    }
  };

  // Obtener ubicación del usuario al cargar el componente
  useEffect(() => {
    getUserLocation();
  }, []);

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
        if (data.error) {
          console.error('Error desde el servidor:', data.error);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const getCarMarkerIcon = (vehicle: Vehicle) => {
    // SVG de un carro similar a Uber
    const color = vehicle.available ? '#22c55e' : '#ef4444'; // Verde si disponible, rojo si no
    const carSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color}">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 16C5.67 16 5 15.33 5 14.5S5.67 13 6.5 13 8 13.67 8 14.5 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5S16.67 13 17.5 13 19 13.67 19 14.5 18.33 16 17.5 16ZM5 11L6.5 6.5H17.5L19 11H5Z"/>
        <circle cx="12" cy="12" r="2" fill="white"/>
      </svg>
    `;
    
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(carSvg)}`,
      scaledSize: new google.maps.Size(32, 32),
      anchor: new google.maps.Point(16, 16),
      origin: new google.maps.Point(0, 0)
    };
  };

  // Función para crear marcador de inicio (verde con "A")
  const getOriginMarkerIcon = () => {
    const originSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M16 0C7.16 0 0 7.16 0 16C0 24.84 16 40 16 40S32 24.84 32 16C32 7.16 24.84 0 16 0Z" fill="#22c55e"/>
        <circle cx="16" cy="16" r="12" fill="white"/>
        <text x="16" y="22" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#22c55e">A</text>
      </svg>
    `;
    
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(originSvg)}`,
      scaledSize: new google.maps.Size(32, 40),
      anchor: new google.maps.Point(16, 40),
      origin: new google.maps.Point(0, 0)
    };
  };

  // Función para crear marcador de destino (rojo con "B")
  const getDestinationMarkerIcon = () => {
    const destinationSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M16 0C7.16 0 0 7.16 0 16C0 24.84 16 40 16 40S32 24.84 32 16C32 7.16 24.84 0 16 0Z" fill="#ef4444"/>
        <circle cx="16" cy="16" r="12" fill="white"/>
        <text x="16" y="22" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ef4444">B</text>
      </svg>
    `;
    
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(destinationSvg)}`,
      scaledSize: new google.maps.Size(32, 40),
      anchor: new google.maps.Point(16, 40),
      origin: new google.maps.Point(0, 0)
    };
  };

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleClosePopup = () => {
    setSelectedVehicle(null);
    setShowRoute(false);
    setRoutePath([]);
    setDirectionsResult(null);
    setIsLoadingRoute(false);
    setRouteMarkers({ origin: null, destination: null });
  };

  const handleViewRoute = async (vehicle: Vehicle) => {
    setIsLoadingRoute(true);
    setShowRoute(true);
    
    try {
      // Intentar obtener la ruta real del backend primero
      const response = await axios.get(`http://127.0.0.1:8000/api/travel/route/${vehicle.travel_id}/`, {
        headers: authService.getAuthHeaders(),
      });
      
      const routeData: RouteData = response.data;
      console.log("Ruta obtenida del backend:", routeData);
      
      // Establecer marcadores de origen y destino
      setRouteMarkers({
        origin: routeData.origin,
        destination: routeData.destination
      });
      
      // Si tenemos polilínea codificada, usarla
      if (routeData.encoded_polyline && window.google) {
        console.log("Usando polilínea codificada del backend");
        const decodedPath = window.google.maps.geometry.encoding.decodePath(routeData.encoded_polyline);
        setRoutePath(decodedPath);
        setUseBackendRoute(true);
        setDirectionsResult(null);
        
        // Ajustar zoom a la ruta
        fitMapToRoute(routeData.origin, routeData.destination);
      } else {
        // Si no hay polilínea, usar Google Directions API con las coordenadas de origen y destino
        console.log("No hay polilínea codificada, usando Google Directions API");
        await loadRouteWithGoogleDirections(routeData.origin, routeData.destination);
        
        // Ajustar zoom a la ruta
        fitMapToRoute(routeData.origin, routeData.destination);
      }
      
      setIsLoadingRoute(false);
      
    } catch (error) {
      console.warn("Error obteniendo ruta del backend, usando posición actual del vehículo:", error);
      
      // Fallback: crear ruta simulada desde la posición actual del vehículo
      const mockDestination = {
        lat: vehicle.position.lat + (Math.random() - 0.5) * 0.01,
        lng: vehicle.position.lng + (Math.random() - 0.5) * 0.01
      };
      
      // Establecer marcadores para el fallback
      setRouteMarkers({
        origin: vehicle.position,
        destination: mockDestination
      });
      
      await loadRouteWithGoogleDirections(vehicle.position, mockDestination);
      fitMapToRoute(vehicle.position, mockDestination);
      setIsLoadingRoute(false);
    }
  };

  // Función auxiliar para ajustar el zoom de la ruta
  const fitMapToRoute = (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
    if (!mapInstance) return;
    
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(new google.maps.LatLng(origin.lat, origin.lng));
    bounds.extend(new google.maps.LatLng(destination.lat, destination.lng));
    
    // Ajustar el mapa a los límites con padding
    mapInstance.fitBounds(bounds, {
      top: 100,
      bottom: 100,
      left: 100,
      right: 100
    });
    
    // Asegurar un zoom mínimo y máximo
    setTimeout(() => {
      const currentZoom = mapInstance.getZoom();
      if (currentZoom && currentZoom > 15) {
        mapInstance.setZoom(15); // Zoom máximo
      } else if (currentZoom && currentZoom < 10) {
        mapInstance.setZoom(10); // Zoom mínimo
      }
    }, 100);
  };

  // Función auxiliar para cargar ruta con Google Directions API
  const loadRouteWithGoogleDirections = async (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
    if (!window.google) {
      console.error("Google Maps no está disponible");
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          console.log("Ruta obtenida de Google Directions API");
          setDirectionsResult(result);
          setUseBackendRoute(false);
          setRoutePath([]);
        } else {
          console.warn("No se pudo obtener la ruta de Google Maps:", status);
          // Crear una ruta simple punto a punto como último recurso
          const simplePath = [
            new window.google.maps.LatLng(origin.lat, origin.lng),
            new window.google.maps.LatLng(destination.lat, destination.lng)
          ];
          setRoutePath(simplePath);
          setUseBackendRoute(true);
          setDirectionsResult(null);
        }
      }
    );
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
        center={userLocation || defaultCenter}
        zoom={13}
        onLoad={(map) => setMapInstance(map)}
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
            icon={getCarMarkerIcon(vehicle)}
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
                      disabled={showRoute || isLoadingRoute}
                    >
                      {isLoadingRoute ? 'Cargando ruta...' : showRoute ? 'Ruta mostrada' : 'Ver Ruta'}
                    </button>
                  </div>
                </div>
              </InfoWindowF>
            )}
          </MarkerF>
        ))}

        {/* Marcadores de origen y destino de la ruta */}
        {showRoute && routeMarkers.origin && (
          <MarkerF
            position={routeMarkers.origin}
            icon={getOriginMarkerIcon()}
            title="Origen de la ruta"
            zIndex={1000} // Mayor z-index para que aparezca sobre otros marcadores
          />
        )}
        
        {showRoute && routeMarkers.destination && (
          <MarkerF
            position={routeMarkers.destination}
            icon={getDestinationMarkerIcon()}
            title="Destino de la ruta"
            zIndex={1000} // Mayor z-index para que aparezca sobre otros marcadores
          />
        )}
        
        {/* Mostrar la ruta del backend si está disponible */}
        {showRoute && useBackendRoute && routePath.length > 0 && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: '#6a5acd',
              strokeOpacity: 0.8,
              strokeWeight: 5,
              geodesic: true,
            }}
          />
        )}
        
        {/* Mostrar la ruta de Google Maps si el backend falló */}
        {showRoute && !useBackendRoute && directionsResult && (
          <DirectionsRenderer
            directions={directionsResult}
            options={{
              suppressMarkers: true, // Usamos nuestros propios marcadores
              polylineOptions: {
                strokeColor: '#6a5acd',
                strokeWeight: 5,
                strokeOpacity: 0.8,
              },
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
