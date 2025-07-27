// client/src/features/driver/components/layout/DriverSidebar.tsx (VERSIÓN FINAL CON LOGOUT)

import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom"; // 1. Importar useNavigate
import {
  List,
  Car,
  Route as RouteIcon,
  Star as StarIcon,
  LogOut, // 2. Importar el ícono de LogOut
} from "lucide-react";
import { DriverProfile } from "../../../../types/driver.types";
import { getDriverProfile } from "../../../../services/driverDataService";
import styles from "./DriverSidebar.module.css";

const DriverSidebar: React.FC = () => {
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const location = useLocation();
  const navigate = useNavigate(); // 3. Obtener la función de navegación

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

  // 4. Crear la función para manejar el cierre de sesión
  const handleLogout = () => {
    // 1. Muestra la ventana de confirmación nativa del navegador
    const isConfirmed = window.confirm(
      "¿Estás seguro de que quieres cerrar sesión?"
    );

    // 2. Si el usuario hace clic en "Aceptar" (OK), procede con el cierre de sesión
    if (isConfirmed) {
      localStorage.clear();
      navigate("/");
    }
    // Si el usuario hace clic en "Cancelar", no hace nada.
  };

  // ... (código de carga y error sin cambios)
  if (loadingProfile) {
    return (
      <aside className={`${styles.sidebar} ${styles.sidebarLoading}`}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando perfil...</p>
      </aside>
    );
  }

  if (!profile) {
    return (
      <aside className={`${styles.sidebar} ${styles.sidebarError}`}>
        <p>No se pudo cargar el perfil.</p>
      </aside>
    );
  }

  return (
    <aside className={styles.sidebar}>
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
        {/* ... (Tus NavLink no cambian) ... */}
        <NavLink
          to="my-routes"
          className={({ isActive }) => {
            const baseDriverPath = "/driver";
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

      {/* 5. AÑADIR EL BOTÓN DE CERRAR SESIÓN AL FINAL */}
      <div className={styles.sidebarFooter}>
        <button className={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default DriverSidebar;
