// client/src/features/driver/components/tracking/DriverTracking.tsx

import React, { useEffect, useRef, useState } from 'react';

interface DriverTrackingProps {
  travelId: string; // El ID del viaje activo
}

const DriverTracking: React.FC<DriverTrackingProps> = ({ travelId }) => {
  const socket = useRef<WebSocket | null>(null);
  // Estados para controlar lo que se ve en pantalla
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [trackingStatus, setTrackingStatus] = useState<string>('Listo para iniciar');
  const [lastPosition, setLastPosition] = useState<{ lat: number; lon: number } | null>(null);
  
  // Referencia para guardar el ID del proceso de rastreo y poder detenerlo
  const watchId = useRef<number | null>(null);

  // Este useEffect se encarga ÚNICAMENTE de la conexión del WebSocket.
  // Ya no inicia el rastreo por sí solo.
  useEffect(() => {
     const wsUrl = `ws://10.168.58.145:8000/ws/travel/${travelId}/`;

     socket.current = new WebSocket(wsUrl);

    socket.current.onopen = () => {
      setIsConnected(true);
      console.log('Socket conectado. Listo para recibir órdenes.');
    };

    socket.current.onclose = () => {
      setIsConnected(false);
      console.log('Socket desconectado.');
      // Si el socket se cierra, detenemos el rastreo para no gastar batería.
      stopLocationTracking(); 
    };

    socket.current.onerror = (error) => {
      console.error('Error de WebSocket:', error);
      setTrackingStatus('Error de conexión');
    };
    
    // Función de limpieza que se ejecuta cuando el componente desaparece
    return () => {
      console.log("Limpiando componente...");
      stopLocationTracking(); // Detiene el rastreo
      socket.current?.close(); // Cierra el socket
    };
  }, [travelId]); // Se reconecta si el ID del viaje cambia.

  // --- FUNCIONES DE CONTROL MANUAL ---

  const startLocationTracking = () => {
    // 1. Verificaciones previas
    if (!navigator.geolocation) {
      setTrackingStatus('Error: Tu navegador no soporta geolocalización.');
      return;
    }
    if (watchId.current !== null) {
      console.log("El rastreo ya está activo.");
      return; // No hacer nada si ya está activo
    }

    // 2. Iniciar el rastreo
    setTrackingStatus('Rastreando...');
    watchId.current = navigator.geolocation.watchPosition(
      // Función que se ejecuta cada vez que hay una nueva ubicación
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        // Actualiza el estado para mostrar las coordenadas en pantalla
        setLastPosition(coords); 
        // Envía los datos al servidor si el socket está abierto
        if (socket.current?.readyState === WebSocket.OPEN) {
          socket.current.send(JSON.stringify(coords));
        }
      },
      // Función que se ejecuta si hay un error de geolocalización
      (error) => {
        console.error('Error de Geolocalización:', error);
        setTrackingStatus(`Error de ubicación: ${error.message}`);
      },
      // Opciones para la precisión
      { enableHighAccuracy: true }
    );
  };

  const stopLocationTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
      setTrackingStatus('Rastreo detenido.');
      console.log("Rastreo de ubicación detenido manualmente.");
    }
  };


  // --- RENDERIZADO DEL COMPONENTE ---

  return (
    <div>
      {/* Sección de Estado */}
      <p>
        <strong>Estado de la Conexión:</strong>
        <span style={{ color: isConnected ? 'green' : 'red', marginLeft: '5px' }}>
          {isConnected ? 'Conectado' : 'Desconectado'}
        </span>
      </p>
      <p><strong>Estado del Rastreo:</strong> {trackingStatus}</p>

      {/* Sección de Datos Recibidos */}
      {lastPosition && (
        <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
          <h4>Última Ubicación Enviada</h4>
          <p>Latitud: <strong>{lastPosition.lat.toFixed(4)}</strong></p>
          <p>Longitud: <strong>{lastPosition.lon.toFixed(4)}</strong></p>
        </div>
      )}

      {/* Sección de Controles */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={startLocationTracking} 
          disabled={!isConnected || trackingStatus === 'Rastreando...'}
        >
          Iniciar Rastreo
        </button>

        <button 
          onClick={stopLocationTracking} 
          disabled={trackingStatus !== 'Rastreando...'}
        >
          Finalizar Rastreo
        </button>
      </div>
    </div>
  );
};

export default DriverTracking;