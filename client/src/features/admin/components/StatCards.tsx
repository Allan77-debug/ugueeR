import React from 'react';

interface StatCardsProps {
    stats: {
      pendientes: number
      aprobadas: number
      rechazadas: number
    }
  }
  
  const StatCards = ({ stats }: StatCardsProps) => {
    return (
      <div className="stat-cards">
        <div className="stat-card pending">
          <div className="stat-header">
            <h3>Solicitudes Pendientes</h3>
            <span className="stat-badge pending">{stats.pendientes}</span>
          </div>
          <div className="stat-value">{stats.pendientes}</div>
          <div className="stat-description">instituciones esperando aprobación</div>
        </div>
  
        <div className="stat-card approved">
          <div className="stat-header">
            <h3>Instituciones Aprobadas</h3>
            <span className="stat-badge approved">{stats.aprobadas}</span>
          </div>
          <div className="stat-value">{stats.aprobadas}</div>
          <div className="stat-description">instituciones activas en la plataforma</div>
        </div>
  
        <div className="stat-card rejected">
          <div className="stat-header">
            <h3>Solicitudes Rechazadas</h3>
            <span className="stat-badge rejected">{stats.rechazadas}</span>
          </div>
          <div className="stat-value">{stats.rechazadas}</div>
          <div className="stat-description">instituciones no aprobadas</div>
        </div>
      </div>
    )
  }
  
  export default StatCards
  
  