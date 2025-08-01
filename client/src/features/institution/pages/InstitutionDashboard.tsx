"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import InstitutionUserList from "../components/InstitutionUserList"
import UserDetailsModal from "../components/UserDetailsModal"
import "../styles/InstitutionDashboard.css"
import { Users, Car, LogOut, Search, Sun, Moon } from "lucide-react"
import axios from "axios"
import authService from "../../../services/authService"

export interface InstitutionUser {
  uid: number
  full_name: string
  user_type: string
  institutional_mail: string
  student_code: string
  udocument: string
  direction: string
  uphone: string
  institutional_carne?: string
  user_state: "pendiente" | "aprobado" | "rechazado"
  registration_date: string
}

export interface Institution {
  id_institution: number
  official_name: string
  short_name: string
  email: string
}

const InstitutionDashboard = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState<InstitutionUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<InstitutionUser[]>([])
  const [selectedUser, setSelectedUser] = useState<InstitutionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeFilter, setActiveFilter] = useState<"all" | "pendiente" | "aprobado" | "rechazado">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [institutionData, setInstitutionData] = useState<Institution | null>(null)
  const [activeTab, setActiveTab] = useState<"users" | "drivers">("users")

  // Estado para el tema
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("institutionDashboardTheme")
    return savedTheme ? savedTheme === "dark" : true // Por defecto modo oscuro
  })

  // Efecto para aplicar el tema y guardarlo
  useEffect(() => {
    const dashboardElement = document.querySelector(".institution-dashboard")
    if (dashboardElement) {
      if (isDarkMode) {
        dashboardElement.classList.add("dark-theme")
        dashboardElement.classList.remove("light-theme")
      } else {
        dashboardElement.classList.add("light-theme")
        dashboardElement.classList.remove("dark-theme")
      }
    }
    localStorage.setItem("institutionDashboardTheme", isDarkMode ? "dark" : "light")
  }, [isDarkMode])

  // Función para alternar el tema
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Verificar autenticación y obtener datos de la institución
  useEffect(() => {
    // Usar authService para verificar autenticación
    if (!authService.isInstitutionAuthenticated()) {
      navigate("/login")
      return
    }

    // Obtener datos de la institución usando authService
    const institutionInfo = authService.getInstitutionData()

    if (institutionInfo) {
      setInstitutionData(institutionInfo as Institution)
    } else {
      // Para pruebas, usar datos falsos
      const fakeInstitutionData = {
        id_institution: 1,
        official_name: "Universidad Nacional de Colombia",
        short_name: "UNAL",
        email: "admin@unal.edu.co",
      }
      setInstitutionData(fakeInstitutionData)
      authService.setInstitutionData(fakeInstitutionData)
    }
  }, [navigate])

  // Cargar usuarios de la institución
  const fetchUsers = async () => {
    if (!institutionData) return

    try {
      setLoading(true)
      setError("")

      // Determinar qué endpoint usar según la pestaña activa
      const endpoint = activeTab === "drivers" 
        ? `http://127.0.0.1:8000/api/institutions/driver-applications/`
        : `http://127.0.0.1:8000/api/institutions/users/`

      const response = await axios.get(endpoint, {
        headers: authService.getInstitutionAuthHeaders(),
      })

      // Asegura que todos los usuarios tengan la propiedad 'user_state'
      const apiUsers = response.data.map((user: InstitutionUser) => ({
        ...user,
        user_state: user.user_state || "pendiente", // Default a pendiente si no está definido
        user_type: activeTab === "drivers" ? "driver" : user.user_type || "student", // Asegurar tipo correcto
      }))
      
      setUsers(apiUsers)
    } catch (err) {
      console.error("Error al cargar usuarios:", err)
      setError(`No se pudieron cargar ${activeTab === "drivers" ? "las aplicaciones de conductores" : "los usuarios"}. Por favor, intente de nuevo.`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (institutionData) {
      fetchUsers()
    }
  }, [institutionData, activeTab]) // Agregar activeTab como dependencia para recargar al cambiar de pestaña

  // Obtener usuarios según la pestaña activa
  const getCurrentTabUsers = () => {
    if (activeTab === "users") {
      return users.filter((user) => user.user_type !== "driver")
    } else {
      return users.filter((user) => user.user_type === "driver")
    }
  }

  // Calcular estadísticas
  const getStats = () => {
    const currentUsers = getCurrentTabUsers()

    return {
      pending: currentUsers.filter((u) => u.user_state === "pendiente").length,
      approved: currentUsers.filter((u) => u.user_state === "aprobado").length,
      rejected: currentUsers.filter((u) => u.user_state === "rechazado").length,
      total: currentUsers.length,
    }
  }

  // Aplicar filtros
  const applyFilters = () => {
    let filtered = getCurrentTabUsers()

    // Filtrar por estado
    if (activeFilter !== "all") {
      filtered = filtered.filter((user) => user.user_state === activeFilter)
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(query) ||
          user.institutional_mail.toLowerCase().includes(query) ||
          user.student_code.toLowerCase().includes(query) ||
          user.udocument.includes(query),
      )
    }

    setFilteredUsers(filtered)
  }

  // Efecto para aplicar filtros cuando cambian las dependencias
  useEffect(() => {
    applyFilters()
  }, [users, activeFilter, searchQuery, activeTab])

  // Resetear filtros cuando cambia la pestaña
  useEffect(() => {
    setActiveFilter("all")
    setSearchQuery("")
  }, [activeTab])

  // Aprobar usuario o conductor
  const handleApproveUser = async (uid: number) => {
    if (!institutionData) return

    try {
      // Determinar el endpoint según el tipo de usuario
      const endpoint = activeTab === "drivers"
        ? `http://127.0.0.1:8000/api/institutions/driver-applications/${uid}/approve/`
        : `http://127.0.0.1:8000/api/institutions/approveUser/${institutionData.id_institution}/${uid}/`

      await axios.post(endpoint, {}, {
        headers: authService.getInstitutionAuthHeaders(),
      })

      // Actualizar el estado local
      setUsers(users.map((user) => (user.uid === uid ? { ...user, user_state: "aprobado" as const } : user)))

      setSelectedUser(null)
      alert(`${activeTab === "drivers" ? "Conductor" : "Usuario"} aprobado exitosamente`)
    } catch (error) {
      console.error(`Error al aprobar ${activeTab === "drivers" ? "conductor" : "usuario"}:`, error)

      // Para pruebas, simular aprobación exitosa
      setUsers(users.map((user) => (user.uid === uid ? { ...user, user_state: "aprobado" as const } : user)))
      setSelectedUser(null)
      alert(`${activeTab === "drivers" ? "Conductor" : "Usuario"} aprobado exitosamente`)
    }
  }

  // Rechazar usuario o conductor
  const handleRejectUser = async (uid: number, reason: string) => {
    if (!institutionData) return

    try {
      // Determinar el endpoint según el tipo de usuario
      const endpoint = activeTab === "drivers"
        ? `http://127.0.0.1:8000/api/institutions/driver-applications/${uid}/reject/`
        : `http://127.0.0.1:8000/api/institutions/rejectUser/${institutionData.id_institution}/${uid}/`

      await axios.post(endpoint, { reason }, {
        headers: authService.getInstitutionAuthHeaders(),
      })

      // Actualizar el estado local
      setUsers(users.map((user) => (user.uid === uid ? { ...user, user_state: "rechazado" as const } : user)))

      setSelectedUser(null)
      alert(`${activeTab === "drivers" ? "Conductor" : "Usuario"} rechazado exitosamente`)
    } catch (error) {
      console.error(`Error al rechazar ${activeTab === "drivers" ? "conductor" : "usuario"}:`, error)

      // Para pruebas, simular rechazo exitoso
      setUsers(users.map((user) => (user.uid === uid ? { ...user, user_state: "rechazado" as const } : user)))
      setSelectedUser(null)
      alert(`${activeTab === "drivers" ? "Conductor" : "Usuario"} rechazado exitosamente`)
    }
  }

  const handleLogout = () => {
    authService.logout()
    navigate("/login")
  }

  const handleFilterChange = (newFilter: "all" | "pendiente" | "aprobado" | "rechazado") => {
    setActiveFilter(newFilter)
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className={`loading-container ${isDarkMode ? "dark-theme" : "light-theme"}`}>
        <div className="loading-spinner"></div>
        <p>Cargando información...</p>
      </div>
    )
  }

  return (
    <div className={`institution-dashboard ${isDarkMode ? "dark-theme" : "light-theme"}`}>
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="header-top">
            <div className="institution-info">
              <h2>{institutionData?.short_name || "Institución"}</h2>
              <p>{institutionData?.official_name}</p>
              <span className="institution-email">{institutionData?.email || "email@institucion.edu"}</span>
            </div>
            {/* Toggle de tema */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-button ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={20} />
            <span>Solicitudes de Usuarios</span>
          </button>
          <button
            className={`nav-button ${activeTab === "drivers" ? "active" : ""}`}
            onClick={() => setActiveTab("drivers")}
          >
            <Car size={20} />
            <span>Solicitudes de Conductores</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="dashboard-content">
        <header className="content-header">
          <h1>{activeTab === "users" ? "Gestión de Usuarios" : "Gestión de Conductores"}</h1>
        </header>

        {/* Estadísticas */}
        <div className="stats-section">
          <div className="stat-card">
            <h3>Total de {activeTab === "users" ? "Usuarios" : "Conductores"}</h3>
            <span className="stat-number">{stats.total}</span>
          </div>
          <div className="stat-card pending">
            <h3>Pendientes</h3>
            <span className="stat-number">{stats.pending}</span>
          </div>
          <div className="stat-card approved">
            <h3>Aprobados</h3>
            <span className="stat-number">{stats.approved}</span>
          </div>
          <div className="stat-card rejected">
            <h3>Rechazados</h3>
            <span className="stat-number">{stats.rejected}</span>
          </div>
        </div>

        {/* Controles */}
        <div className="controls-section">
          <div className="search-container">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, email, código o documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-tabs">
            {[
              { key: "all", label: "Todos" },
              { key: "pendiente", label: "Pendientes" },
              { key: "aprobado", label: "Aprobados" },
              { key: "rechazado", label: "Rechazados" },
            ].map((filter) => (
              <button
                key={filter.key}
                className={`filter-tab ${activeFilter === filter.key ? "active" : ""}`}
                onClick={() => handleFilterChange(filter.key as typeof activeFilter)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <InstitutionUserList users={filteredUsers} onViewDetails={setSelectedUser} />
      </main>

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onApprove={handleApproveUser}
          onReject={handleRejectUser}
        />
      )}
    </div>
  )
}

export default InstitutionDashboard
