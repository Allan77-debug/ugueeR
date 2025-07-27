"use client"
import { Link, useNavigate } from "react-router-dom"
import { Building, Settings, LogOut, Sun, Moon } from "lucide-react"

interface AdminSidebarProps {
  isDarkMode: boolean
  toggleTheme: () => void
}

const AdminSidebar = ({ isDarkMode, toggleTheme }: AdminSidebarProps) => {
  const navigate = useNavigate()

  // Función para cerrar sesión
  const handleLogout = () => {
    // Eliminar el token y los datos del usuario del localStorage
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")

    console.log("Sesión cerrada correctamente")

    // Redireccionar al inicio
    navigate("/")
  }
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="header-content">
          <h2>Admin Panel</h2>
          {/* Toggle de tema */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      <nav className="sidebar-nav">
        <Link to="/admin" className="sidebar-link active">
          <Building size={20} />
          <span>Instituciones</span>
        </Link>

        <Link to="/admin/configuracion" className="sidebar-link">
          <Settings size={20} />
          <span>Configuración</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar
