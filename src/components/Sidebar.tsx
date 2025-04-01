import Link from "next/link"
import styles from "../app/admin/Admin.module.css"

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2>Admin Panel</h2>
      </div>

      <nav className={styles.sidebarNav}>
        <ul>
          {/*
          <li className={styles.navItem}>
            <Link href="/admin" className={styles.navLink}>
              <span className={styles.navIcon}>📊</span>
              Dashboard
            </Link>
          </li>
          */}
          <li className={`${styles.navItem} ${styles.active}`}>
            <Link href="/admin" className={styles.navLink}>
              <span className={styles.navIcon}>🏢</span>
              Instituciones
            </Link>
          </li>
          {/*
          <li className={styles.navItem}>
            <Link href="/admin/users" className={styles.navLink}>
              <span className={styles.navIcon}>👥</span>
              Usuarios
            </Link>
          </li>
          */}
          <li className={styles.navItem}>
            <Link href="/admin/settings" className={styles.navLink}>
              <span className={styles.navIcon}>⚙️</span>
              Configuración
            </Link>
          </li>
        </ul>
      </nav>

      <div className={styles.sidebarFooter}>
        <button className={styles.logoutButton}>
          <span className={styles.logoutIcon}>🚪</span>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}

