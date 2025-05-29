"use client"

import React from "react"
import { Eye } from "lucide-react"
import type { InstitutionUser } from "../pages/InstitutionDashboard"

interface InstitutionUserListProps {
  users: InstitutionUser[]
  onViewDetails: (user: InstitutionUser) => void
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  } catch (error) {
    console.error("Error al formatear fecha:", error)
    return dateString
  }
}

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

const InstitutionUserList = ({ users, onViewDetails }: InstitutionUserListProps) => {
  if (users.length === 0) {
    return (
      <div className="empty-state">
        <p>No se encontraron usuarios que coincidan con los criterios de búsqueda.</p>
      </div>
    )
  }

  return (
    <div className="users-list">
      <table className="users-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Email</th>
            <th>Código</th>
            <th>Estado</th>
            <th>Fecha de Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.uid}>
              <td className="user-name">
                <div>
                  <div className="name">{user.full_name}</div>
                  <div className="document">Doc: {user.udocument}</div>
                </div>
              </td>
              <td>
                <span className={`user-type-badge ${user.user_type}`}>{getUserTypeLabel(user.user_type)}</span>
              </td>
              <td>{user.institutional_mail}</td>
              <td>{user.student_code}</td>
              <td>
                <span className={`status-badge ${user.status}`}>
                  {user.status === "pendiente" ? "Pendiente" : user.status === "aprobado" ? "Aprobado" : "Rechazado"}
                </span>
              </td>
              <td>{formatDate(user.registration_date)}</td>
              <td>
                <button className="action-button view" onClick={() => onViewDetails(user)} aria-label="Ver detalles">
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

export default InstitutionUserList
