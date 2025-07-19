import React from 'react';
import { Outlet } from 'react-router-dom';
// Corrección de Rutas de Importación:
import DriverSidebar from './DriverSidebar'; // Ya está en la misma carpeta
import styles from './DriverPageLayout.module.css';

const DriverPageLayout: React.FC = () => {
  return (
    <div className={styles.dashboardLayout}>
      <DriverSidebar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default DriverPageLayout;