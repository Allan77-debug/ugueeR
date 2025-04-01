"use client"

import type { Institution } from "../app/admin/types"
import styles from "../app/admin/Admin.module.css"

interface InstitutionListProps {
  institutions: Institution[]
  onViewDetails: (institution: Institution) => void
}

export default function InstitutionList({ institutions, onViewDetails }: InstitutionListProps) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.institutionsTable}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Ubicación</th>
            <th>Estado</th>
            <th>Fecha de Solicitud</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {institutions.length > 0 ? (
            institutions.map((institution) => (
              <tr key={institution.id}>
                <td className={styles.institutionCell}>
                  <div className={styles.institutionInfo}>
                    <div className={styles.institutionLogo}>
                      <img src={institution.logo || "/placeholder.svg"} alt={`Logo de ${institution.name}`} />
                    </div>
                    <div>
                      <div className={styles.institutionName}>{institution.name}</div>
                      <div className={styles.institutionShortName}>{institution.shortName}</div>
                    </div>
                  </div>
                </td>
                <td>{institution.email}</td>
                <td>{institution.location}</td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${styles[`status${institution.status.charAt(0).toUpperCase() + institution.status.slice(1)}`]}`}
                  >
                    {institution.status.charAt(0).toUpperCase() + institution.status.slice(1)}
                  </span>
                </td>
                <td>{institution.applicationDate}</td>
                <td>
                  <button className={styles.actionButton} onClick={() => onViewDetails(institution)}>
                    <span className={styles.viewIcon}>👁️</span>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className={styles.noResults}>
                No se encontraron instituciones
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

