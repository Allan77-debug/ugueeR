"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import InstitutionUserList from "../components/InstitutionUserList"
import UserDetailsModal from "../components/UserDetailsModal"
import "../styles/InstitutionDashboard.css"
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
  status: "pending" | "approved" | "rejected"
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
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [institutionData, setInstitutionData] = useState<Institution | null>(null)

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

      setUsers(response.data)
      setFilteredUsers(response.data)
    } catch (err) {
      console.error("Error al cargar usuarios:", err)
      setError("No se pudieron cargar los usuarios. Por favor, intente de nuevo.")

      // Para pruebas, usar datos falsos si falla la API
      const mockUsers: InstitutionUser[] = [
        {
          uid: 1,
          full_name: "Juan Pérez García",
          user_type: "student",
          institutional_mail: "juan.perez@unal.edu.co",
          student_code: "20201234",
          udocument: "1234567890",
          direction: "Calle 123 #45-67",
          uphone: "3001234567",
          institutional_carne: "/media/carnes/juan_carne.jpg",
          status: "pending",
          registration_date: "2025-01-15T10:30:00Z",
        },
        {
          uid: 2,
          full_name: "María López Rodríguez",
          user_type: "teacher",
          institutional_mail: "maria.lopez@unal.edu.co",
          student_code: "PROF001",
          udocument: "9876543210",
          direction: "Carrera 45 #12-34",
          uphone: "3109876543",
          institutional_carne: "/media/carnes/maria_carne.jpg",
          status: "approved",
          registration_date: "2025-01-10T14:20:00Z",
        },
        {
          uid: 3,
          full_name: "Carlos Martínez Silva",
          user_type: "admin",
          institutional_mail: "carlos.martinez@unal.edu.co",
          student_code: "ADM001",
          udocument: "5555666677",
          direction: "Avenida 68 #23-45",
          uphone: "3155555666",
          status: "pending",
          registration_date: "2025-01-12T09:15:00Z",
        },
        {
          uid: 4,
          full_name: "Ana Gómez Torres",
          user_type: "student",
          institutional_mail: "ana.gomez@unal.edu.co",
          student_code: "20205678",
          udocument: "1111222233",
          direction: "Calle 50 #30-20",
          uphone: "3201112222",
          institutional_carne: "/media/carnes/ana_carne.jpg",
          status: "rejected",
          registration_date: "2025-01-08T16:45:00Z",
        },
      ]
      setUsers(mockUsers)
      setFilteredUsers(mockUsers)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (institutionData) {
      fetchUsers()
    }
  }, [institutionData])

  // Filtrar usuarios
  useEffect(() => {
    let filtered = [...users]

    // Filtrar por estado
    if (activeFilter !== "all") {
      filtered = filtered.filter((user) => user.status === activeFilter)
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.institutional_mail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.student_code.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredUsers(filtered)
  }, [users, activeFilter, searchQuery])

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
      setUsers(users.map((user) => (user.uid === uid ? { ...user, status: "approved" as const } : user)))

      setSelectedUser(null)
      alert("Usuario aprobado exitosamente")
    } catch (error) {
      console.error("Error al aprobar usuario:", error)
      alert("No se pudo aprobar el usuario. Inténtelo de nuevo.")
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
      setUsers(users.map((user) => (user.uid === uid ? { ...user, status: "rejected" as const } : user)))

      setSelectedUser(null)
      alert("Usuario rechazado exitosamente")
    } catch (error) {
      console.error("Error al rechazar usuario:", error)
      alert("No se pudo rechazar el usuario. Inténtelo de nuevo.")
    }
  }

  // Estadísticas
  const stats = {
    pending: users.filter((u) => u.status === "pending").length,
    approved: users.filter((u) => u.status === "approved").length,
    rejected: users.filter((u) => u.status === "rejected").length,
    total: users.length,
  }

  const handleLogout = () => {
    localStorage.removeItem("institutionToken")
    localStorage.removeItem("institutionData")
    navigate("/login")
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    )
  }

  return (
    <div className="institution-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="institution-info">
            <h1>{institutionData?.short_name || "Institución"}</h1>
            <p>{institutionData?.official_name}</p>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="stats-section">
          <div className="stat-card">
            <h3>Total de Usuarios</h3>
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

        <div className="controls-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar por nombre, email o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-tabs">
            {["all", "pending", "approved", "rejected"].map((filter) => (
              <button
                key={filter}
                className={`filter-tab ${activeFilter === filter ? "active" : ""}`}
                onClick={() => setActiveFilter(filter as typeof activeFilter)}
              >
                {filter === "all"
                  ? "Todos"
                  : filter === "pending"
                    ? "Pendientes"
                    : filter === "approved"
                      ? "Aprobados"
                      : "Rechazados"}
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
