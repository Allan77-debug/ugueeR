// client/src/features/driver/components/tracking/DriverTracking.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';

interface DriverTrackingProps {
  travelId: string;
}

const DriverTracking: React.FC<DriverTrackingProps> = ({ travelId }) => {
  const socket = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState('Listo para iniciar');
  const [lastPosition, setLastPosition] = useState<{ lat: number; lon: number } | null>(null);
  const watchId = useRef<number | null>(null);

  // --- LÓGICA DE RASTREO (SEPARADA) ---
  // Usamos useCallback para que estas funciones no se creen de nuevo en cada render,
  // lo cual ayuda a prevenir bucles en useEffects si las pasáramos como dependencias.
  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setTrackingStatus('Error: Tu navegador no soporta geolocalización.');
      return;
    }
    if (watchId.current !== null) return;

    setTrackingStatus('Rastreando...');
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setLastPosition(coords);
        if (socket.current?.readyState === WebSocket.OPEN) {
          socket.current.send(JSON.stringify(coords));
        }
      },
      (error) => {
        setTrackingStatus(`Error de ubicación: ${error.message}`);
      },
      { enableHighAccuracy: true }
    );
  }, []); // El array vacío [] significa que esta función NUNCA cambia.

  const stopLocationTracking = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
      setTrackingStatus('Rastreo detenido.');
    }
  }, []); // Esta función tampoco cambia nunca.

  // --- EFECTO PARA LA CONEXIÓN DEL WEBSOCKET ---
  // Este useEffect se encarga solo de la conexión.
  useEffect(() => {
    // Evita reconexiones innecesarias si el socket ya está conectado o conectándose.
    if (socket.current) {
        socket.current.close();
    }

    const wsUrl = `wss://10.168.58.145:8000/ws/travel/123/`;
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      setIsConnected(true);
      setTrackingStatus('Conectado. Listo para iniciar.');
    };
    newSocket.onclose = () => {
      setIsConnected(false);
      // Si la conexión se cierra, nos aseguramos de detener el rastreo.
      stopLocationTracking(); 
    };
    newSocket.onerror = (error) => {
      console.error('Error de WebSocket:', error);
      setTrackingStatus('Error de conexión');
    };

    socket.current = newSocket;

    // La función de limpieza es crucial para evitar conexiones fantasma
    return () => {
      stopLocationTracking();
      newSocket.close();
    };
  }, [travelId, stopLocationTracking]); // Solo se ejecuta si travelId cambia.


  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div>
      {/* ... (el mismo JSX que teníamos antes con los botones y la visualización de datos) ... */}
      <p><strong>Estado de la Conexión:</strong> {isConnected ? 'Conectado' : 'Desconectado'}</p>
      <p><strong>Estado del Rastreo:</strong> {trackingStatus}</p>
      
      {lastPosition && (
        <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #ccc' }}>
          <h4>Última Ubicación Enviada</h4>
          <p>Latitud: <strong>{lastPosition.lat.toFixed(4)}</strong></p>
          <p>Longitud: <strong>{lastPosition.lon.toFixed(4)}</strong></p>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <button onClick={startLocationTracking} disabled={!isConnected || trackingStatus === 'Rastreando...'}>
          Iniciar Rastreo
        </button>
        <button onClick={stopLocationTracking} disabled={trackingStatus !== 'Rastreando...'} style={{ marginLeft: '10px' }}>
          Finalizar Rastreo
        </button>
      </div>
    </div>
  );
};

export default DriverTracking;