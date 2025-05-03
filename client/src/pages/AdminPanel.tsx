"use client";

import React, { useEffect, useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar.tsx";
import AdminHeader from "../components/admin/AdminHeader.tsx";
import InstitutionsList from "../components/admin/InstitutionList.tsx";
import InstitutionDetailsModal from "../components/admin/InstitutionDetailsModal.tsx";
import StatCards from "../components/admin/StatCards.tsx";
import "../styles/AdminPanel.css";

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  status: "pendiente" | "aprobada" | "rechazada";
  applicationDate: string;
  location: string;
}

const mockInstitutions: Institution[] = [
  {
    id: "1",
    name: "Universidad Nacional de Colombia",
    shortName: "UNAL",
    email: "info@unal.edu.co",
    phone: "+57 1 234 5678",
    address: "Carrera 45 # 26-85",
    city: "Bogotá",
    state: "Cundinamarca",
    postalCode: "111321",
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
    address: "Carrera 1 # 18A-12",
    city: "Bogotá",
    state: "Cundinamarca",
    postalCode: "111711",
    logo: "/placeholder.svg",
    primaryColor: "#6a5acd",
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
    postalCode: "760032",
    logo: "/placeholder.svg",
    primaryColor: "#6a5acd",
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
    postalCode: "050010",
    logo: "/placeholder.svg",
    primaryColor: "#6a5acd",
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
    postalCode: "680002",
    logo: "/placeholder.svg",
    primaryColor: "#6a5acd",
    secondaryColor: "#ffffff",
    status: "pendiente",
    applicationDate: "3/26/2025",
    location: "Bucaramanga, Santander",
  },
];

const AdminPanel = () => {
    // Estado para el filtro activo
  const [activeFilter, setActiveFilter] = useState<
    "todas" | "pendiente" | "aprobada" | "rechazada"
  >("todas");
    // Estado para la búsqueda
  const [searchQuery, setSearchQuery] = useState("");

  // Estado para la institución seleccionada
  const [selectedInstitution, setSelectedInstitution] =
    useState<Institution | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  useEffect(() => {
    // Simula fetch
    setInstitutions(mockInstitutions);
  }, []);

    // Estadísticas
  const updateStats = () => {
    const pendientes = institutions.filter(
      (i) => i.status === "pendiente"
    ).length;
    const aprobadas = institutions.filter(
      (i) => i.status === "aprobada"
    ).length;
    const rechazadas = institutions.filter(
      (i) => i.status === "rechazada"
    ).length;
    return { pendientes, aprobadas, rechazadas };
  };


  // Filtrar instituciones según el filtro activo y la búsqueda
  const filteredInstitutions = institutions.filter((institution) => {
    if (activeFilter !== "todas" && institution.status !== activeFilter)
      return false;

    if (
      searchQuery &&
      !institution.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !institution.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;

    return true;
  });

  
  // Manejar la apertura del modal de detalles
  const handleViewDetails = (institution: Institution) => {
    setSelectedInstitution(institution);
  };
  
  // Manejar el cierre del modal de detalles
  const handleCloseModal = () => {
    setSelectedInstitution(null);
  };

  const handleApproveInstitution = async (id: string, role: string) => {
    // axios.post(`/api/institutions/${id}/approve`, { role })
    console.log(`Approving institution ${id} with role: ${role}`);
    setInstitutions((prev) =>
      prev.map((inst) =>
        inst.id === id ? { ...inst, status: "aprobada" } : inst
      )
    );
    setSelectedInstitution(null);
  };

  const handleRejectInstitution = async (id: string, reason: string) => {
    // axios.post(`/api/institutions/${id}/reject`, { reason })
    console.log(`Institution ${id} rejected with reason: ${reason}`);
    setInstitutions((prev) =>
      prev.map((inst) =>
        inst.id === id ? { ...inst, status: "rechazada" } : inst
      )
    );
    setSelectedInstitution(null);
  };

  return (
    <div className="admin-panel">
      <AdminSidebar />
      <div className="admin-content">
        <AdminHeader />
        <main className="admin-main">
          <h1>Panel de Administración</h1>
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
                onClick={() =>
                  setActiveFilter(
                    filter as "todas" | "pendiente" | "aprobada" | "rechazada"
                  )
                }
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
          <InstitutionsList
            institutions={filteredInstitutions}
            onViewDetails={handleViewDetails}
          />
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
  );
};

export default AdminPanel;
