"use client"

import { Eye } from "lucide-react"
import type { Institution } from "../../pages/AdminPanel"

interface InstitutionsListProps {
  institutions: Institution[]
  onViewDetails: (institution: Institution) => void
}

const InstitutionsList = ({ institutions, onViewDetails }: InstitutionsListProps) => {
  return (
    <div className="institutions-list">
      <h2>Todas las Instituciones</h2>

      <table className="institutions-table">
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
          {institutions.map((institution) => (
            <tr key={institution.id}>
              <td className="institution-name">
                <div className="logo-placeholder">Logo</div>
                <div>
                  <div>{institution.name}</div>
                  <div className="institution-shortname">{institution.shortName}</div>
                </div>
              </td>
              <td>{institution.email}</td>
              <td>{institution.location}</td>
              <td>
                <span className={`status-badge ${institution.status}`}>
                  {institution.status.charAt(0).toUpperCase() + institution.status.slice(1)}
                </span>
              </td>
              <td>{institution.applicationDate}</td>
              <td>
                <button
                  className="action-button view"
                  onClick={() => onViewDetails(institution)}
                  aria-label="Ver detalles"
                >
                  <Eye size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default InstitutionsList

