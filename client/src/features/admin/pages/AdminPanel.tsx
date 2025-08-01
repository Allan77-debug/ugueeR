"use client"

import { useEffect, useState } from "react"
import AdminSidebar from "../components/AdminSidebar.tsx"
import AdminHeader from "../components/AdminHeader.tsx"
import InstitutionsList from "../components/InstitutionList.tsx"
import InstitutionDetailsModal from "../components/InstitutionDetailsModal.tsx"
import StatCards from "../components/StatCards.tsx"
import "../styles/AdminPanel.css"
import { useNavigate } from "react-router-dom"
import { Sun, Moon } from "lucide-react"
import axios from "axios"

export interface Institution {
  id_institution: string
  official_name: string
  short_name: string
  email: string
  phone: string
  address: string
  city: string
  istate: string
  postal_code: string
  logo?: string
  primary_color?: string
  secondary_color?: string
  status: "pendiente" | "aprobada" | "rechazada"
  application_date: string
  rejection_reason?: string
}

const AdminPanel = () => {
  const navigate = useNavigate()

  // Estado para el tema
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("adminPanelTheme")
    return savedTheme ? savedTheme === "dark" : true // Por defecto modo oscuro
  })

  // Efecto para aplicar el tema y guardarlo
  useEffect(() => {
    const dashboardElement = document.querySelector(".admin-panel")
    if (dashboardElement) {
      if (isDarkMode) {
        dashboardElement.classList.add("dark-theme")
        dashboardElement.classList.remove("light-theme")
      } else {
        dashboardElement.classList.add("light-theme")
        dashboardElement.classList.remove("dark-theme")
      }
    }
    localStorage.setItem("adminPanelTheme", isDarkMode ? "dark" : "light")
  }, [isDarkMode])

  // Función para alternar el tema
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Verificar autenticación
  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      navigate("/login-admin")
    }
  }, [navigate])

  // Estado para el filtro activo
  const [activeFilter, setActiveFilter] = useState<"todas" | "pendiente" | "aprobada" | "rechazada">("todas")
  // Estado para la búsqueda
  const [searchQuery, setSearchQuery] = useState("")

  // Estado para la institución seleccionada
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null)
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchInstitutions = async () => {
    try {
      setLoading(true)
      setError("")

      // Construir la URL de la API según el filtro activo
      let url = "http://localhost:8000/api/institutions/list/"
      if (activeFilter !== "todas") {
        url += `?status=${activeFilter}`
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })

      setInstitutions(response.data)
    } catch (err) {
      console.error("Error al cargar instituciones:", err)
      setError("No se pudieron cargar las instituciones. Por favor, intente de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  // Cargar instituciones cuando cambia el filtro
  useEffect(() => {
    fetchInstitutions()
  }, [activeFilter])

  // Estadísticas
  const updateStats = () => {
    const pendientes = institutions.filter((i) => i.status === "pendiente").length
    const aprobadas = institutions.filter((i) => i.status === "aprobada").length
    const rechazadas = institutions.filter((i) => i.status === "rechazada").length
    return { pendientes, aprobadas, rechazadas }
  }

  // Filtrar instituciones según el filtro activo y la búsqueda
  const filteredInstitutions = institutions.filter((institution) => {
    if (activeFilter !== "todas" && institution.status !== activeFilter) return false

    if (
      searchQuery &&
      !institution.official_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !institution.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false

    return true
  })

  // Manejar la apertura del modal de detalles
  const handleViewDetails = (institution: Institution) => {
    setSelectedInstitution(institution)
  }

  // Manejar el cierre del modal de detalles
  const handleCloseModal = () => {
    setSelectedInstitution(null)
  }

  const handleApproveInstitution = async (id: string, role: string) => {
    try {
      await axios.post(
        `http://localhost:8000/api/admins/${id}/approve/`,
        { role }, // Añadimos el rol seleccionado
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      )

      // Actualizar la lista de instituciones tras aprobación exitosa
      fetchInstitutions()
      setSelectedInstitution(null)
      alert("La institución ha sido aprobada exitosamente.")
    } catch (error) {
      console.error("Error al aprobar institución:", error)
      alert("No se pudo aprobar la institución. Inténtelo de nuevo.")
    }
  }

  const handleRejectInstitution = async (id: string, reason: string) => {
    try {
      await axios.post(
        `http://localhost:8000/api/admins/${id}/reject/`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      )

      // Actualizar la lista de instituciones tras rechazo exitoso
      fetchInstitutions()
      setSelectedInstitution(null)
    } catch (error) {
      console.error("Error al rechazar institución:", error)
      alert("No se pudo rechazar la institución. Inténtelo de nuevo.")
    }
  }

  return (
    <div className={`admin-panel ${isDarkMode ? "dark-theme" : "light-theme"}`}>
      <AdminSidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <div className="admin-content">
        <AdminHeader />
        <main className="admin-main">
          <div className="main-header">
            <h1>Panel de Administración</h1>
            {/* Toggle de tema en el header principal también */}
            <button
              className="theme-toggle-main"
              onClick={toggleTheme}
              title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <StatCards stats={updateStats()} />
          <div className="search-filter-container">
            <div className="search-container">
              <input
                type="text"
                placeholder="Buscar instituciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <div className="tabs">
            {["todas", "pendiente", "aprobada", "rechazada"].map((filter) => (
              <button
                key={filter}
                className={`tab ${activeFilter === filter ? "active" : ""}`}
                onClick={() => setActiveFilter(filter as "todas" | "pendiente" | "aprobada" | "rechazada")}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-indicator">Cargando instituciones...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : filteredInstitutions.length === 0 ? (
            <div className="empty-state">
              No hay instituciones {activeFilter !== "todas" ? `con estado "${activeFilter}"` : ""}.
            </div>
          ) : (
            <InstitutionsList institutions={filteredInstitutions} onViewDetails={handleViewDetails} />
          )}
        </main>
      </div>

      {selectedInstitution && (
        <InstitutionDetailsModal
          institution={selectedInstitution}
          onClose={handleCloseModal}
          onApprove={handleApproveInstitution}
          onReject={handleRejectInstitution}
        />
      )}
    </div>
  )
}

export default AdminPanel
