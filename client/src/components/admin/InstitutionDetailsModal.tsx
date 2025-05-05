"use client"
import React from 'react';
import { useState } from "react"
import { X, Check } from "lucide-react"
import type { Institution } from "../../pages/AdminPanel"

interface InstitutionDetailsModalProps {
  institution: Institution
  onClose: () => void
  onApprove: (id: string, role: string) => void
  onReject: (id: string, reason: string) => void
}

const InstitutionDetailsModal = ({ institution, onClose, onApprove, onReject }: InstitutionDetailsModalProps) => {
  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState<"general" | "visual" | "decision">("general")

  // Estado para el rol seleccionado
  const [selectedRole, setSelectedRole] = useState("Universidad")

  // Estado para el motivo de rechazo
  const [rejectionReason, setRejectionReason] = useState("")

  const adaptedInstitution = {
    id: institution.id_institution,
    name: institution.official_name,
    shortName: institution.short_name,
    email: institution.email,
    phone: institution.phone,
    address: institution.address,
    city: institution.city,
    state: institution.istate,
    postalCode: institution.postal_code,
    primaryColor: institution.primary_color || "#6a5acd",
    secondaryColor: institution.secondary_color || "#ffffff",
    status: institution.status || "pendiente",
    applicationDate: new Date(institution.application_date).toLocaleDateString(),
    logo: institution.logo ? `http://localhost:8000${institution.logo}` : undefined
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Detalles de la Institución</h2>
          <p>Revise la información de la institución para aprobar o rechazar su solicitud.</p>
          <button className="close-button" onClick={onClose} title="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="institution-header">
          {adaptedInstitution.logo ? (
            <img 
              src={adaptedInstitution.logo} 
              alt={`Logo de ${adaptedInstitution.shortName}`} 
              className="institution-logo large"
            />
          ) : (
            <div className="logo-placeholder large">Logo de {adaptedInstitution.shortName}</div>
          )}
          
          <div className="institution-info">
            <h3>{adaptedInstitution.name}</h3>
            <p>{adaptedInstitution.shortName}</p>
            <span className={`status-badge ${adaptedInstitution.status}`}>
              {adaptedInstitution.status.charAt(0).toUpperCase() + adaptedInstitution.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${activeTab === "general" ? "active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            Información General
          </button>
          <button
            className={`modal-tab ${activeTab === "visual" ? "active" : ""}`}
            onClick={() => setActiveTab("visual")}
          >
            Identidad Visual
          </button>
          {adaptedInstitution.status === "pendiente" && (
            <button
              className={`modal-tab ${activeTab === "decision" ? "active" : ""}`}
              onClick={() => setActiveTab("decision")}
            >
              Decisión
            </button>
          )}
        </div>

        <div className="modal-content">
          {activeTab === "general" && (
            <div className="tab-content">
              <h3>Información de Contacto</h3>

              <div className="info-grid">
                <div className="info-item">
                  <label>Email:</label>
                  <p>{adaptedInstitution.email}</p>
                </div>

                <div className="info-item">
                  <label>Teléfono:</label>
                  <p>{adaptedInstitution.phone}</p>
                </div>

                <div className="info-item">
                  <label>Dirección:</label>
                  <p>{adaptedInstitution.address}</p>
                </div>

                <div className="info-item">
                  <label>Ciudad:</label>
                  <p>{adaptedInstitution.city}</p>
                </div>

                <div className="info-item">
                  <label>Estado/Provincia:</label>
                  <p>{adaptedInstitution.state}</p>
                </div>

                <div className="info-item">
                  <label>Código Postal:</label>
                  <p>{adaptedInstitution.postalCode}</p>
                </div>
              </div>

              <h3>Información Adicional</h3>

              <div className="info-grid">
                <div className="info-item">
                  <label>Fecha de Solicitud:</label>
                  <p>{adaptedInstitution.applicationDate}</p>
                </div>

                <div className="info-item">
                  <label>Estado:</label>
                  <p>{adaptedInstitution.status === "pendiente" 
                    ? "Pendiente de Revisión" 
                    : adaptedInstitution.status === "aprobada" 
                      ? "Aprobada" 
                      : "Rechazada"}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "visual" && (
            <div className="tab-content">
              <div className="visual-identity">
                <div className="logo-section">
                  <h3>Logo Institucional</h3>
                  <div className="logo-preview">
                    {adaptedInstitution.logo ? (
                      <img 
                        src={adaptedInstitution.logo} 
                        alt={`Logo de ${adaptedInstitution.name}`} 
                        className="institution-logo extra-large"
                      />
                    ) : (
                      <div className="logo-placeholder extra-large">Logo de {adaptedInstitution.name}</div>
                    )}
                  </div>
                </div>

                <div className="colors-section">
                  <h3>Colores Institucionales</h3>

                  <div className="color-item">
                    <label>Color Principal</label>
                    <div className="color-preview">
                      <div className="color-box" style={{ backgroundColor: adaptedInstitution.primaryColor }}></div>
                      <span>{adaptedInstitution.primaryColor}</span>
                    </div>
                  </div>

                  <div className="color-item">
                    <label>Color Secundario</label>
                    <div className="color-preview">
                      <div className="color-box" style={{ backgroundColor: adaptedInstitution.secondaryColor }}></div>
                      <span>{adaptedInstitution.secondaryColor}</span>
                    </div>
                  </div>

                  <h3>Vista Previa</h3>
                  <div
                    className="preview-box"
                    style={{
                      backgroundColor: adaptedInstitution.primaryColor,
                      color: adaptedInstitution.secondaryColor,
                    }}
                  >
                    {adaptedInstitution.name}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "decision" && adaptedInstitution.status === "pendiente" && (
            <div className="tab-content">
              <div className="decision-section">
                <div className="approve-section">
                  <h3>Aprobar Institución</h3>

                  <div className="form-group">
                    <label htmlFor="role-select">Seleccionar Rol</label>
                    <select
                      id="role-select"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="role-select"
                    >
                      <option value="Universidad">Universidad</option>
                      <option value="Colegio">Colegio</option>
                      <option value="Instituto">Instituto</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <p className="role-info">
                    El rol determina los permisos y funcionalidades disponibles para la institución.
                  </p>

                  <button className="approve-button" onClick={() => onApprove(adaptedInstitution.id, selectedRole)}>
                    <Check size={18} /> Aprobar Institución
                  </button>
                </div>

                <div className="reject-section">
                  <h3>Rechazar Institución</h3>

                  <div className="form-group">
                    <label>Motivo del Rechazo (Obligatorio)</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explique el motivo del rechazo..."
                      className="rejection-reason"
                      required
                    ></textarea>
                  </div>

                  <button 
                    className="reject-button" 
                    onClick={() => {
                      if (!rejectionReason.trim()) {
                        alert("Por favor proporcione un motivo para el rechazo.");
                        return;
                      }
                      onReject(adaptedInstitution.id, rejectionReason);
                    }}
                  >
                    <X size={18} /> Rechazar Institución
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="close-button-text" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default InstitutionDetailsModal