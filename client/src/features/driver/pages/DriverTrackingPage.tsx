// client/src/features/driver/pages/DriverTrackingPage.tsx
import React from 'react';
// Asumiendo que el componente de rastreo está en la ruta que te sugerí
import DriverTracking from '../components/tracking/DriverTracking'; // <-- ¡OJO! He creado una subcarpeta "tracking" para ser más ordenado.

const DriverTrackingPage = () => {
  // En una aplicación real, este ID no estaría "hardcodeado".
  // Probablemente lo obtendrías del estado de la aplicación o de los parámetros de la URL.
  const activeTravelId = "viaje-en-curso-789";

  return (
    <div>
      <h2>Rastreo de Viaje en Tiempo Real</h2>
      <p>
        El rastreo para el viaje <strong>{activeTravelId}</strong> está activo.
      </p>
      <hr />
      {/* El componente que hace la magia de los WebSockets */}
      <DriverTracking travelId={activeTravelId} />
    </div>
  );
};

export default DriverTrackingPage;