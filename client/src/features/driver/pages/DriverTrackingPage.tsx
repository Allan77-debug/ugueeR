// client/src/features/driver/pages/DriverTrackingPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom'; // <-- 1. Importa useParams
import DriverTracking from '../components/tracking/DriverTracking';

const DriverTrackingPage = () => {
  // 2. Usa el hook para obtener los parámetros de la URL
  const { travelId } = useParams(); 

  // 3. ¡LA COMPROBACIÓN CRUCIAL!
  // Si por alguna razón no hay un travelId, muestra un mensaje en lugar de romper la app.
  if (!travelId) {
    return (
      <div>
        <h2>Error</h2>
        <p>No se ha proporcionado un ID de viaje en la URL.</p>
        <p>Por favor, acceda a esta página a través de la lista de "Mis Rutas".</p>
      </div>
    );
  }

  // Si todo está bien, renderiza el componente de rastreo
  return (
    <div>
      <h2>Rastreo de Viaje en Tiempo Real</h2>
      <p>
        El rastreo para el viaje <strong>{travelId}</strong> está activo.
      </p>
      <hr />
      <DriverTracking travelId={travelId} />
    </div>
  );
};

export default DriverTrackingPage;