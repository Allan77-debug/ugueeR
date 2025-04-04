import { Link } from "react-router-dom"
import Header from "../components/Header.tsx"
import "../styles/HomePage.css"

const HomePage = () => {
  return (
    <div className="home-container">
      <Header />

      <section className="hero-section">
        <div className="hero-content">
          <h1>Tu viaje seguro y confiable</h1>
          <p>Regístrate y accede a un transporte validado por instituciones.</p>
          <Link to="/registro-institucion" className="cta-button">
            Empieza ahora
          </Link>
        </div>
        <div className="hero-image">
          <p>Persona en un vehículo usando la app</p>
        </div>
      </section>

      <section className="features-section">
        <h2>¿Por qué usar nuestra plataforma?</h2>

        <div className="features-grid">
          <div className="feature-card">
            <h3>Seguridad Garantizada</h3>
            <p>Conductores y vehículos validados para tu tranquilidad.</p>
          </div>

          <div className="feature-card">
            <h3>Variedad de Rutas</h3>
            <p>Elige entre viajes intermunicipales, metropolitanos y dentro del campus.</p>
          </div>

          <div className="feature-card">
            <h3>Fácil Acceso</h3>
            <p>Accede desde web o app móvil para gestionar tus viajes.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>© 2025 Uguee. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

export default HomePage

