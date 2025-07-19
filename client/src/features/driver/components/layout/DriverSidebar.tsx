// client/src/features/driver/components/layout/DriverSidebar.tsx (VERSIÓN FINAL CORREGIDA)

import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom"; // Asegúrate de que useLocation esté importado
import { List, Car, Route as RouteIcon, Star as StarIcon } from "lucide-react";
import { DriverProfile } from "../../../../types/driver.types";
import { getDriverProfile } from "../../../../services/driverDataService";
import styles from "./DriverSidebar.module.css";

const DriverSidebar: React.FC = () => {
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // El hook `useLocation` DEBE llamarse aquí, en el nivel superior del componente.
  const location = useLocation();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const profileData = await getDriverProfile();
        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching driver profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  if (loadingProfile) {
    // ... (código de carga sin cambios)
    return (
      <aside className={`${styles.sidebar} ${styles.sidebarLoading}`}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando perfil...</p>
      </aside>
    );
  }

  if (!profile) {
    // ... (código de error sin cambios)
    return (
      <aside className={`${styles.sidebar} ${styles.sidebarError}`}>
        <p>No se pudo cargar el perfil.</p>
      </aside>
    );
  }

  return (
    <aside className={styles.sidebar}>
      {/* ... (código del header y perfil sin cambios) ... */}
      <div className={styles.sidebarHeader}>
        <h2>Uway</h2>
      </div>

      <div className={styles.userProfile}>
        <div className={styles.userAvatar}>
          <span>{profile.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className={styles.userInfo}>
          <h3>{profile.name}</h3>
          <p>{profile.university}</p>
          <div className={styles.rating}>
            <StarIcon size={16} className={styles.starIcon} />
            <span>{profile.rating.toFixed(1)}</span>
          </div>
          {profile.isDriver && (
            <span className={styles.driverBadge}>Conductor</span>
          )}
        </div>
      </div>

      <nav className={styles.sidebarNav}>
        <NavLink
          to="my-routes"
          className={({ isActive }) => {
            // --- TODA LA LÓGICA ESTÁ AHORA AQUÍ DENTRO ---
            const baseDriverPath = "/driver"; // La ruta que tienes en App.tsx

            // Usamos la variable `location` que obtuvimos arriba con el hook
            const isAtBaseDriverPath =
              location.pathname === baseDriverPath ||
              location.pathname === `${baseDriverPath}/`;

            const isLinkActive = isActive || isAtBaseDriverPath;

            return `${styles.navButton} ${isLinkActive ? styles.active : ""}`;
          }}
        >
          <RouteIcon size={20} />
          <span>Mis Rutas</span>
        </NavLink>

        <NavLink
          to="my-vehicles"
          className={({ isActive }) =>
            `${styles.navButton} ${isActive ? styles.active : ""}`
          }
        >
          <Car size={20} />
          <span>Mis Vehículos</span>
        </NavLink>

        <NavLink
          to="my-trips"
          className={({ isActive }) =>
            `${styles.navButton} ${isActive ? styles.active : ""}`
          }
        >
          <List size={20} />
          <span>Mis Viajes</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default DriverSidebar;
