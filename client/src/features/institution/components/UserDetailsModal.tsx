"use client"
import React, { useState } from "react"
import { X, Check, User, Mail, Phone, MapPin, FileText, Calendar } from "lucide-react"
import type { InstitutionUser } from "../pages/InstitutionDashboard"

interface UserDetailsModalProps {
  user: InstitutionUser
  onClose: () => void
  onApprove: (uid: number) => void
  onReject: (uid: number, reason: string) => void
}

const UserDetailsModal = ({ user, onClose, onApprove, onReject }: UserDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState<"details" | "documents" | "decision">("details")
  const [rejectionReason, setRejectionReason] = useState("")

  const getUserTypeLabel = (userType: string): string => {
    switch (userType) {
      case "student":
        return "Estudiante"
      case "teacher":
        return "Profesor"
      case "admin":
        return "Administrativo"
      case "employee":
        return "Empleado"
      default:
        return "Otro"
    }
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  const handleApprove = () => {
    if (window.confirm("¿Está seguro de que desea aprobar este usuario?")) {
      onApprove(user.uid)
    }
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Por favor proporcione un motivo para el rechazo.")
      return
    }

    if (window.confirm("¿Está seguro de que desea rechazar este usuario?")) {
      onReject(user.uid, rejectionReason)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Detalles del Usuario</h2>
          <p>Revise la información del usuario para aprobar o rechazar su solicitud.</p>
          <button className="close-button" onClick={onClose} title="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="user-header">
          <div className="user-avatar">
            <User size={32} />
          </div>
          <div className="user-info">
            <h3>{user.full_name}</h3>
            <p>{user.institutional_mail}</p>
            <span className={`status-badge ${user.status}`}>
              {user.status === "pendiente" ? "Pendiente" : user.status === "aprobado" ? "Aprobado" : "Rechazado"}
            </span>
          </div>
        </div>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Información Personal
          </button>
          <button
            className={`modal-tab ${activeTab === "documents" ? "active" : ""}`}
            onClick={() => setActiveTab("documents")}
          >
            Documentos
          </button>
          {user.status === "pendiente" && (
            <button
              className={`modal-tab ${activeTab === "decision" ? "active" : ""}`}
              onClick={() => setActiveTab("decision")}
            >
              Decisión
            </button>
          )}
        </div>

        <div className="modal-content">
          {activeTab === "details" && (
            <div className="tab-content">
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-icon">
                    <User size={16} />
                  </div>
                  <div>
                    <label>Tipo de Usuario:</label>
                    <p>{getUserTypeLabel(user.user_type)}</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <FileText size={16} />
                  </div>
                  <div>
                    <label>Código Institucional:</label>
                    <p>{user.student_code}</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <FileText size={16} />
                  </div>
                  <div>
                    <label>Documento de Identidad:</label>
                    <p>{user.udocument}</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <Mail size={16} />
                  </div>
                  <div>
                    <label>Email Institucional:</label>
                    <p>{user.institutional_mail}</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <Phone size={16} />
                  </div>
                  <div>
                    <label>Teléfono:</label>
                    <p>{user.uphone}</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <label>Dirección:</label>
                    <p>{user.direction}</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <label>Fecha de Registro:</label>
                    <p>{formatDate(user.registration_date)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="tab-content">
              <div className="documents-section">
                <h3>Carné Institucional</h3>
                {user.institutional_carne ? (
                  <div className="document-preview">
                    <img
                      src={`http://127.0.0.1:8000${user.institutional_carne}`}
                      alt="Carné institucional"
                      className="document-image"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                        e.currentTarget.nextElementSibling!.style.display = "block"
                      }}
                    />
                    <div className="document-placeholder" style={{ display: "none" }}>
                      <FileText size={48} />
                      <p>No se pudo cargar la imagen del carné</p>
                    </div>
                  </div>
                ) : (
                  <div className="document-placeholder">
                    <FileText size={48} />
                    <p>No se ha subido carné institucional</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "decision" && user.status === "pendiente" && (
            <div className="tab-content">
              <div className="decision-section">
                <div className="approve-section">
                  <h3>Aprobar Usuario</h3>
                  <p className="decision-info">
                    Al aprobar este usuario, podrá acceder a todas las funcionalidades de la plataforma.
                  </p>
                  <button className="approve-button" onClick={handleApprove}>
                    <Check size={18} /> Aprobar Usuario
                  </button>
                </div>

                <div className="reject-section">
                  <h3>Rechazar Usuario</h3>
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
                  <button className="reject-button" onClick={handleReject}>
                    <X size={18} /> Rechazar Usuario
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

export default UserDetailsModal
