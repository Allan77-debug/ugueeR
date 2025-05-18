"use client"

import { Eye } from "lucide-react"
import type { Institution } from "../pages/AdminPanel"
import React from 'react';

interface InstitutionsListProps {
  institutions: Institution[]
  onViewDetails: (institution: Institution) => void
}

// Función para formatear la fecha
const formatDate = (dateString: string): string => {
  try {
    
    // Crear objeto Date con la cadena ISO
    const date = new Date(dateString);
    
    // Formatear a YYYY-MM-DD
    return date.toISOString().split('T')[0];
    
    // Alternativa
    // return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return dateString; // Devolver la cadena original si hay error
  }
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
            <tr key={institution.id_institution}>
              <td className="institution-name">
                <div className="logo-placeholder">Logo</div>
                <div>
                  <div>{institution.official_name}</div>
                  <div className="institution-shortname">{institution.short_name}</div>
                </div>
              </td>
              <td>{institution.email}</td>
              <td>{institution.city}</td>
              <td>
                <span className={`status-badge ${institution.status}`}>
                  {institution.status.charAt(0).toUpperCase() + institution.status.slice(1)}
                </span>
              </td>
              <td>{formatDate(institution.application_date)}</td>
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

