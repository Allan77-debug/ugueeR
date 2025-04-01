import { useState } from "react"
import styles from "./Admin.module.css"
import InstitutionList from "../components/InstitutionList"
import Sidebar from "../components/Sidebar"
import InstitutionModal from "../components/InstitutionModal"
import type { Institution, InstitutionStatus } from "./types"

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"todas" | "pendientes" | "aprobadas" | "rechazadas">("todas")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("todos")

  // Datos de ejemplo - en producción vendrían de una API
  const [institutions, setInstitutions] = useState<Institution[]>([
    {
      id: "1",
      name: "Universidad Nacional de Colombia",
      shortName: "UNAL",
      email: "info@unal.edu.co",
      phone: "+57 1 234 5678",
      address: "Carrera 45 # 26-85",
      city: "Bogotá",
      state: "Cundinamarca",
      zipCode: "111321",
      logo: "/placeholder.svg",
      primaryColor: "#6a5acd",
      secondaryColor: "#ffffff",
      status: "pendiente",
      applicationDate: "3/28/2025",
      location: "Bogotá, Cundinamarca",
    },
    {
      id: "2",
      name: "Universidad de los Andes",
      shortName: "Uniandes",
      email: "admisiones@uniandes.edu.co",
      phone: "+57 1 332 4545",
      address: "Cra 1 # 18A-12",
      city: "Bogotá",
      state: "Cundinamarca",
      zipCode: "111711",
      logo: "/placeholder.svg",
      primaryColor: "#4285f4",
      secondaryColor: "#ffffff",
      status: "aprobada",
      applicationDate: "3/25/2025",
      location: "Bogotá, Cundinamarca",
    },
    {
      id: "3",
      name: "Universidad del Valle",
      shortName: "Univalle",
      email: "contacto@univalle.edu.co",
      phone: "+57 2 321 2100",
      address: "Calle 13 # 100-00",
      city: "Cali",
      state: "Valle del Cauca",
      zipCode: "760032",
      logo: "/placeholder.svg",
      primaryColor: "#e74c3c",
      secondaryColor: "#ffffff",
      status: "rechazada",
      applicationDate: "3/20/2025",
      location: "Cali, Valle del Cauca",
    },
    {
      id: "4",
      name: "Universidad de Antioquia",
      shortName: "UdeA",
      email: "info@udea.edu.co",
      phone: "+57 4 219 8332",
      address: "Calle 67 # 53-108",
      city: "Medellín",
      state: "Antioquia",
      zipCode: "050010",
      logo: "/placeholder.svg",
      primaryColor: "#27ae60",
      secondaryColor: "#ffffff",
      status: "pendiente",
      applicationDate: "3/27/2025",
      location: "Medellín, Antioquia",
    },
    {
      id: "5",
      name: "Universidad Industrial de Santander",
      shortName: "UIS",
      email: "admisiones@uis.edu.co",
      phone: "+57 7 634 4000",
      address: "Carrera 27 con Calle 9",
      city: "Bucaramanga",
      state: "Santander",
      zipCode: "680002",
      logo: "/placeholder.svg",
      primaryColor: "#f39c12",
      secondaryColor: "#ffffff",
      status: "pendiente",
      applicationDate: "3/26/2025",
      location: "Bucaramanga, Santander",
    },
  ])

  // Contadores para el dashboard
  const pendingCount = institutions.filter((inst) => inst.status === "pendiente").length
  const approvedCount = institutions.filter((inst) => inst.status === "aprobada").length
  const rejectedCount = institutions.filter((inst) => inst.status === "rechazada").length

  // Filtrar instituciones según la pestaña activa y la búsqueda
  const filteredInstitutions = institutions.filter((institution) => {
    // Filtro por estado
    if (activeTab === "pendientes" && institution.status !== "pendiente") return false
    if (activeTab === "aprobadas" && institution.status !== "aprobada") return false
    if (activeTab === "rechazadas" && institution.status !== "rechazada") return false

    // Filtro por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        institution.name.toLowerCase().includes(query) ||
        institution.email.toLowerCase().includes(query) ||
        institution.location.toLowerCase().includes(query)
      )
    }

    return true
  })

  // Abrir modal con detalles de la institución
  const handleOpenModal = (institution: Institution) => {
    setSelectedInstitution(institution)
  }

  // Cerrar modal
  const handleCloseModal = () => {
    setSelectedInstitution(null)
  }

  // Aprobar institución
  const handleApproveInstitution = (id: string, role: string) => {
    setInstitutions(
      institutions.map((inst) => (inst.id === id ? { ...inst, status: "aprobada" as InstitutionStatus } : inst)),
    )
    handleCloseModal()
  }

  // Rechazar institución
  const handleRejectInstitution = (id: string, reason?: string) => {
    setInstitutions(
      institutions.map((inst) =>
        inst.id === id ? { ...inst, status: "rechazada" as InstitutionStatus, rejectionReason: reason } : inst,
      ),
    )
    handleCloseModal()
  }

  return (
    <div className={styles.adminContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <h1 className={styles.pageTitle}>Panel de Administración</h1>

        {/* Dashboard Cards */}
        <div className={styles.dashboardCards}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Solicitudes Pendientes</h3>
              <span className={styles.badgePending}>{pendingCount}</span>
            </div>
            <p className={styles.cardValue}>{pendingCount}</p>
            <p className={styles.cardDescription}>instituciones esperando aprobación</p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Instituciones Aprobadas</h3>
              <span className={styles.badgeApproved}>{approvedCount}</span>
            </div>
            <p className={styles.cardValue}>{approvedCount}</p>
            <p className={styles.cardDescription}>instituciones activas en la plataforma</p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Solicitudes Rechazadas</h3>
              <span className={styles.badgeRejected}>{rejectedCount}</span>
            </div>
            <p className={styles.cardValue}>{rejectedCount}</p>
            <p className={styles.cardDescription}>instituciones no aprobadas</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className={styles.toolbarContainer}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Buscar instituciones..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterContainer}>
            <label htmlFor="filterSelect" className={styles.visuallyHidden}>
              Filtrar por estado
            </label>
            <select
              id="filterSelect"
              className={styles.filterSelect}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobada">Aprobadas</option>
              <option value="rechazada">Rechazadas</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tab} ${activeTab === "todas" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("todas")}
          >
            Todas
          </button>
          <button
            className={`${styles.tab} ${activeTab === "pendientes" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("pendientes")}
          >
            Pendientes
          </button>
          <button
            className={`${styles.tab} ${activeTab === "aprobadas" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("aprobadas")}
          >
            Aprobadas
          </button>
          <button
            className={`${styles.tab} ${activeTab === "rechazadas" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("rechazadas")}
          >
            Rechazadas
          </button>
        </div>

        {/* Institution List */}
        <div className={styles.listContainer}>
          <h2 className={styles.listTitle}>Todas las Instituciones</h2>
          <InstitutionList institutions={filteredInstitutions} onViewDetails={handleOpenModal} />
        </div>
      </main>

      {/* Institution Details Modal */}
      {selectedInstitution && (
        <InstitutionModal
          institution={selectedInstitution}
          onClose={handleCloseModal}
          onApprove={handleApproveInstitution}
          onReject={handleRejectInstitution}
        />
      )}
    </div>
  )
}

