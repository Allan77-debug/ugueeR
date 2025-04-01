"use client"

import { useState } from "react"
import type { Institution } from "../app/admin/types"
import styles from "../app/admin/Admin.module.css"

interface InstitutionModalProps {
  institution: Institution
  onClose: () => void
  onApprove: (id: string, role: string) => void
  onReject: (id: string, reason?: string) => void
}

export default function InstitutionModal({ institution, onClose, onApprove, onReject }: InstitutionModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "visual" | "decision">("info")
  const [selectedRole, setSelectedRole] = useState("universidad")
  const [rejectionReason, setRejectionReason] = useState("")

  // Roles disponibles (en producción vendrían de una API)
  const availableRoles = [
    { id: "universidad", name: "Universidad" },
    { id: "colegio", name: "Colegio" },
    { id: "empresa", name: "Empresa de Transporte" },
    { id: "gobierno", name: "Entidad Gubernamental" },
  ]

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h2>Detalles de la Institución</h2>
          <p className={styles.modalSubtitle}>
            Revise la información de la institución para aprobar o rechazar su solicitud.
          </p>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.institutionHeader}>
          <div className={styles.institutionAvatar}>
            <img src={institution.logo || "/placeholder.svg"} alt={`Logo de ${institution.name}`} />
          </div>
          <div className={styles.institutionHeaderInfo}>
            <h3>{institution.name}</h3>
            <p>{institution.shortName}</p>
            <span
              className={`${styles.statusBadge} ${styles[`status${institution.status.charAt(0).toUpperCase() + institution.status.slice(1)}`]}`}
            >
              {institution.status.charAt(0).toUpperCase() + institution.status.slice(1)}
            </span>
          </div>
        </div>

        <div className={styles.modalTabs}>
          <button
            className={`${styles.modalTab} ${activeTab === "info" ? styles.activeModalTab : ""}`}
            onClick={() => setActiveTab("info")}
          >
            Información General
          </button>
          <button
            className={`${styles.modalTab} ${activeTab === "visual" ? styles.activeModalTab : ""}`}
            onClick={() => setActiveTab("visual")}
          >
            Identidad Visual
          </button>
          <button
            className={`${styles.modalTab} ${activeTab === "decision" ? styles.activeModalTab : ""}`}
            onClick={() => setActiveTab("decision")}
          >
            Decisión
          </button>
        </div>

        <div className={styles.modalContent}>
          {activeTab === "info" && (
            <div className={styles.infoTabContent}>
              <div className={styles.infoSection}>
                <h4>Información de Contacto</h4>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>Email:</label>
                    <span>{institution.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Teléfono:</label>
                    <span>{institution.phone}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Dirección:</label>
                    <span>{institution.address}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Ciudad:</label>
                    <span>{institution.city}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Estado/Provincia:</label>
                    <span>{institution.state}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Código Postal:</label>
                    <span>{institution.zipCode}</span>
                  </div>
                </div>
              </div>

              <div className={styles.infoSection}>
                <h4>Información Adicional</h4>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>Fecha de Solicitud:</label>
                    <span>{institution.applicationDate}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Estado:</label>
                    <span
                      className={`${styles.statusText} ${styles[`statusText${institution.status.charAt(0).toUpperCase() + institution.status.slice(1)}`]}`}
                    >
                      {institution.status === "pendiente"
                        ? "Pendiente de Revisión"
                        : institution.status === "aprobada"
                          ? "Aprobada"
                          : "Rechazada"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "visual" && (
            <div className={styles.visualTabContent}>
              <div className={styles.visualGrid}>
                <div className={styles.logoSection}>
                  <h4>Logo Institucional</h4>
                  <div className={styles.logoContainer}>
                    <img src={institution.logo || "/placeholder.svg"} alt={`Logo de ${institution.name}`} />
                  </div>
                </div>

                <div className={styles.colorsSection}>
                  <h4>Colores Institucionales</h4>
                  <div className={styles.colorInfo}>
                    <label>Color Principal</label>
                    <div className={styles.colorPreview}>
                      <div className={styles.colorSwatch} style={{ backgroundColor: institution.primaryColor }}></div>
                      <span>{institution.primaryColor}</span>
                    </div>
                  </div>

                  <div className={styles.colorInfo}>
                    <label>Color Secundario</label>
                    <div className={styles.colorPreview}>
                      <div className={styles.colorSwatch} style={{ backgroundColor: institution.secondaryColor }}></div>
                      <span>{institution.secondaryColor}</span>
                    </div>
                  </div>

                  <div className={styles.brandPreview}>
                    <h4>Vista Previa</h4>
                    <div
                      className={styles.brandPreviewBox}
                      style={{
                        backgroundColor: institution.primaryColor,
                        color: institution.secondaryColor,
                      }}
                    >
                      {institution.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "decision" && (
            <div className={styles.decisionTabContent}>
              <div className={styles.approvalSection}>
                <h4>Aprobar Institución</h4>

                <div className={styles.roleSelection}>
                  <label htmlFor="roleSelect">Seleccionar Rol</label>
                  <select
                    id="roleSelect"
                    className={styles.roleSelect}
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    {availableRoles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <p className={styles.roleDescription}>
                    El rol determina los permisos y funcionalidades disponibles para la institución.
                  </p>
                </div>

                <button className={styles.approveButton} onClick={() => onApprove(institution.id, selectedRole)}>
                  ✓ Aprobar Institución
                </button>
              </div>

              <div className={styles.rejectionSection}>
                <h4>Rechazar Institución</h4>

                <div className={styles.reasonInput}>
                  <label>Motivo del Rechazo (Opcional)</label>
                  <textarea
                    className={styles.rejectionReason}
                    placeholder="Explique el motivo del rechazo..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  ></textarea>
                </div>

                <button className={styles.rejectButton} onClick={() => onReject(institution.id, rejectionReason)}>
                  ✕ Rechazar Institución
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.closeModalButton} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

