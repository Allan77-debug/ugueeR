import { Link } from "react-router-dom"
import { Building, Settings, LogOut } from "lucide-react"

const AdminSidebar = () => {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
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
        <button className="logout-button">
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar

