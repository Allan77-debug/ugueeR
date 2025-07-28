"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { List, Car, RouteIcon, StarIcon, LogOut, Sun, Moon } from "lucide-react"
import type { DriverProfile } from "../../../../types/driver.types"
import { getDriverProfile } from "../../../../services/driverDataService"
import styles from "./DriverSidebar.module.css"

const DriverSidebar: React.FC = () => {
  const [profile, setProfile] = useState<DriverProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [theme, setTheme] = useState<"light" | "dark">("light")

  const location = useLocation()
  const navigate = useNavigate()

  // Cargar tema desde localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("driverDashboardTheme") as "light" | "dark"
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  // Aplicar tema al documento
  useEffect(() => {
    document.documentElement.setAttribute("data-driver-theme", theme)
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("driverDashboardTheme", newTheme)
  }

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true)
      try {
        const profileData = await getDriverProfile()
        setProfile(profileData)
      } catch (error) {
        console.error("Error fetching driver profile:", error)
      } finally {
        setLoadingProfile(false)
      }
    }
    fetchProfile()
  }, [])

  const handleLogout = () => {
    const isConfirmed = window.confirm("¿Estás seguro de que quieres cerrar sesión?")

    if (isConfirmed) {
      localStorage.clear()
      navigate("/")
    }
  }

  if (loadingProfile) {
    return (
      <aside className={`${styles.sidebar} ${styles.sidebarLoading}`}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando perfil...</p>
      </aside>
    )
  }

  if (!profile) {
    return (
      <aside className={`${styles.sidebar} ${styles.sidebarError}`}>
        <p>No se pudo cargar el perfil.</p>
      </aside>
    )
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2>Uway Driver</h2>
        <button
          onClick={toggleTheme}
          className={styles.themeToggle}
          title={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
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
          {profile.isDriver && <span className={styles.driverBadge}>Conductor</span>}
        </div>
      </div>

      <nav className={styles.sidebarNav}>
        <NavLink
          to="my-routes"
          className={({ isActive }) => {
            const baseDriverPath = "/driver"
            const isAtBaseDriverPath =
              location.pathname === baseDriverPath || location.pathname === `${baseDriverPath}/`
            const isLinkActive = isActive || isAtBaseDriverPath
            return `${styles.navButton} ${isLinkActive ? styles.active : ""}`
          }}
        >
          <RouteIcon size={20} />
          <span>Mis Rutas</span>
        </NavLink>

        <NavLink to="my-vehicles" className={({ isActive }) => `${styles.navButton} ${isActive ? styles.active : ""}`}>
          <Car size={20} />
          <span>Mis Vehículos</span>
        </NavLink>

        <NavLink to="my-trips" className={({ isActive }) => `${styles.navButton} ${isActive ? styles.active : ""}`}>
          <List size={20} />
          <span>Mis Viajes</span>
        </NavLink>
      </nav>

      <div className={styles.sidebarFooter}>
        <button className={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}

export default DriverSidebar
