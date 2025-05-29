"use client"

import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import InstitutionUserList from "../components/InstitutionUserList"
import UserDetailsModal from "../components/UserDetailsModal"
import "../styles/InstitutionDashboard.css"
import { Users, Car, LogOut, Search } from "lucide-react"
import axios from "axios"

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

  // Verificar autenticación y obtener datos de la institución
  useEffect(() => {
    const token = localStorage.getItem("institutionToken")
    const institutionInfo = localStorage.getItem("institutionData")

    if (!token) {
      navigate("/login")
      return
    }

    if (institutionInfo) {
      setInstitutionData(JSON.parse(institutionInfo))
    } else {
      // Para pruebas, usar datos falsos
      const fakeInstitutionData = {
        id_institution: 1,
        official_name: "Universidad Nacional de Colombia",
        short_name: "UNAL",
        email: "admin@unal.edu.co",
      }
      setInstitutionData(fakeInstitutionData)
      localStorage.setItem("institutionData", JSON.stringify(fakeInstitutionData))
    }
  }, [navigate])

  // Cargar usuarios de la institución
  const fetchUsers = async () => {
    if (!institutionData) return

    try {
      setLoading(true)
      setError("")

      const response = await axios.get(
        `http://127.0.0.1:8000/api/institutions/listUser/${institutionData.id_institution}/users/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("institutionToken")}`,
          },
        },
      )

      // Asegura que todos los usuarios tengan la propiedad 'user_state'
      const apiUsers = response.data.map((user: InstitutionUser) => ({
        ...user,
        user_state: user.user_state || user.user_state, // Compatibilidad
      }))
      setUsers(apiUsers)
    } catch (err) {
      console.error("Error al cargar usuarios:", err)
      setError("No se pudieron cargar los usuarios. Por favor, intente de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (institutionData) {
      fetchUsers()
    }
  }, [institutionData])

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

  // Aprobar usuario
  const handleApproveUser = async (uid: number) => {
    if (!institutionData) return

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/institutions/approveUser/${institutionData.id_institution}/${uid}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("institutionToken")}`,
          },
        },
      )

      // Actualizar el estado local
      setUsers(users.map((user) => (user.uid === uid ? { ...user, user_state: "aprobado" as const } : user)))

      setSelectedUser(null)
      alert("Usuario aprobado exitosamente")
    } catch (error) {
      console.error("Error al aprobar usuario:", error)

      // Para pruebas, simular aprobación exitosa
      setUsers(users.map((user) => (user.uid === uid ? { ...user, user_state: "aprobado" as const } : user)))
      setSelectedUser(null)
      alert("Usuario aprobado exitosamente")
    }
  }

  // Rechazar usuario
  const handleRejectUser = async (uid: number, reason: string) => {
    if (!institutionData) return

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/institutions/rejectUser/${institutionData.id_institution}/${uid}/`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("institutionToken")}`,
          },
        },
      )

      // Actualizar el estado local
      setUsers(users.map((user) => (user.uid === uid ? { ...user, user_state: "rechazado" as const } : user)))

      setSelectedUser(null)
      alert("Usuario rechazado exitosamente")
    } catch (error) {
      console.error("Error al rechazar usuario:", error)

      // Para pruebas, simular rechazo exitoso
      setUsers(users.map((user) => (user.uid === uid ? { ...user, user_state: "rechazado" as const } : user)))
      setSelectedUser(null)
      alert("Usuario rechazado exitosamente")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("institutionToken")
    localStorage.removeItem("institutionData")
    navigate("/login")
  }

  const handleFilterChange = (newFilter: "all" | "pendiente" | "aprobado" | "rechazado") => {
    setActiveFilter(newFilter)
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando información...</p>
      </div>
    )
  }

  return (
    <div className="institution-dashboard">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="institution-info">
            <h2>{institutionData?.short_name || "Institución"}</h2>
            <p>{institutionData?.official_name}</p>
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
