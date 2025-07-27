import React from "react"
import { Link } from "react-router-dom"
import Header from "../../../components/Header.tsx"
import "../styles/HomePage.css"

const HomePage = () => {
  return (
    <div className="home-container">
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>Una forma inteligente de moverte</h1>
            <p>
              ¿Estudiante o conductor? Únete hoy a <span className="brand-highlight">Uway</span> para optimizar tus
              viajes. Ofrece o encuentra rutas y viaja seguro.
            </p>
            <Link to="/registro-usuario" className="cta-button">
              Unirme ahora
            </Link>
          </div>
        </div>
        <div className="hero-background">
          <img src="/placeholder.svg?height=600&width=1200" alt="Estudiantes universitarios" className="hero-image" />
        </div>
      </section>

      {/* App Section */}
      <section className="app-section">
        <div className="app-container">
          <div className="app-mockup">
            <div className="phone-frame">
              <div className="phone-screen">
                <div className="app-header">
                  <div className="status-bar">
                    <span>9:41</span>
                    <div className="signal-icons">
                      <span>📶</span>
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>
                </div>

                <div className="app-content">
                  {/* Header Section */}
                  <div className="user-header">
                    <div className="user-greeting">
                      <h3>Hola, Juan</h3>
                      <p>Universidad EAFIT</p>
                    </div>
                    <div className="profile-icon">👤</div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="nav-buttons">
                    <div className="nav-btn">
                      <span className="nav-icon">📋</span>
                      <span>Mis Viajes</span>
                    </div>
                    <div className="nav-btn">
                      <span className="nav-icon">🚗</span>
                      <span>Ser Conductor</span>
                    </div>
                    <div className="nav-btn">
                      <span className="nav-icon">🗺️</span>
                      <span>Ver Mapa</span>
                    </div>
                  </div>

                  {/* Available Trips Section */}
                  <div className="trips-section">
                    <h4>Viajes Disponibles</h4>

                    <div className="trip-card">
                      <div className="trip-route-header">
                        <span className="location-icon">📍</span>
                        <div className="route-text">
                          <span className="route-main">Parque Berrío → Universidad EAFIT</span>
                        </div>
                      </div>

                      <div className="trip-price">$5,000</div>

                      <div className="trip-details-grid">
                        <div className="detail-row">
                          <span className="detail-icon">👤</span>
                          <span>Ana Conductora</span>
                        </div>
                        <div className="detail-row rating">
                          <span className="star">⭐</span>
                          <span>4.8</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-icon">🕐</span>
                          <span>07:30 AM</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-icon">🚗</span>
                          <span>Sedan</span>
                        </div>
                      </div>

                      <div className="trip-footer">
                        <span className="available-seats">3 asientos disponibles</span>
                        <button className="reserve-btn">Reservar</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="app-info">
            <h2>
              Descarga la app de <span className="brand-highlight">Uway</span>
            </h2>

            <div className="qr-section">
              <div className="qr-code">
                <img src="/placeholder.svg?height=150&width=150" alt="Código QR para descargar la app" />
              </div>
              <p className="qr-text">Escanea para descargar la app →</p>
            </div>

            <div className="download-section">
              <h3>Puedes descargarla directamente también:</h3>
              <div className="download-buttons">
                <a href="#" className="download-btn google-play">
                  <img src="/placeholder.svg?height=60&width=180" alt="Descargar en Google Play" />
                </a>
                <a href="#" className="download-btn app-store">
                  <img src="/placeholder.svg?height=60&width=180" alt="Descargar en App Store" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2>¿Por qué elegir Uway?</h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Seguridad Garantizada</h3>
              <p>Conductores y vehículos validados por instituciones educativas para tu tranquilidad.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Variedad de Rutas</h3>
              <p>Encuentra viajes intermunicipales, metropolitanos y dentro del campus universitario.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Fácil de Usar</h3>
              <p>Interfaz intuitiva desde web o app móvil para gestionar todos tus viajes.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Precios Justos</h3>
              <p>Tarifas transparentes y competitivas para estudiantes y trabajadores.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3>Comunidad Universitaria</h3>
              <p>Conecta con otros estudiantes y personal de tu institución educativa.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Tiempo Real</h3>
              <p>Seguimiento en vivo de tu viaje y notificaciones instantáneas.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Uway</h3>
            <p>La forma inteligente de moverte en tu universidad</p>
          </div>
          <div className="footer-section">
            <h4>Enlaces</h4>
            <ul>
              <li>
                <Link to="/registro-institucion">Registro Institución</Link>
              </li>
              <li>
                <Link to="/registro-usuario">Registro Usuario</Link>
              </li>
              <li>
                <Link to="/login">Iniciar Sesión</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Soporte</h4>
            <ul>
              <li>
                <a href="#">Centro de Ayuda</a>
              </li>
              <li>
                <a href="#">Términos y Condiciones</a>
              </li>
              <li>
                <a href="#">Política de Privacidad</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Uway. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage