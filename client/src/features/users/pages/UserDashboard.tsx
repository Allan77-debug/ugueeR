"use client"
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  MapPin,
  Search,
  Filter,
  Clock,
  Calendar,
  User,
  Car,
  ChevronRight,
  MapIcon,
  List,
  Star,
  LogOut,
} from "lucide-react"
import "../styles/UserDashboard.css"
import axios from "axios"

// Interfaces basadas en la estructura de la base de datos
interface UserData {
  uid: number
  fullName: string
  userType: string
  institutionalMail: string
  studentCode: string
  institutionName?: string
  hasAppliedDriver?: boolean 
  driverState?: string
  // Nuevo campo
}

interface Route {
  id_route: number
  origin: string
  destination: string
  departure_time: string
}

interface Vehicle {
  id_vehicle: number
  id_driver: number
  soat: string
  plate: string
  brand: string
  model: string
  vehicle_type: string
  category: string
  technical_mechanical: string
  capacity: number // Campo añadido para la capacidad
}

interface Driver {
  id_driver: number
  full_name: string
  rating: number // Promedio de calificaciones
}

interface Travel {
  id_travel: number
  id_route: number
  id_vehicle: number
  id_driver: number
  id_user: number // Usuario que creó el viaje (conductor)
  time: string // Hora específica del viaje
  travel_state: string // Estado del viaje (activo, cancelado, completado)
  price: number // Campo añadido para el precio
  // Campos calculados o relacionados
  route?: Route
  vehicle?: Vehicle
  driver?: Driver
  availableSeats?: number
}

interface Reservation {
  id_user: number
  id_travel: number
  status: string // pending, confirmed, cancelled
}

const UserDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"trips" | "map">("trips")
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [travels, setTravels] = useState<Travel[]>([])
  const [filteredTravels, setFilteredTravels] = useState<Travel[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterOptions, setFilterOptions] = useState({
    date: "",
    minPrice: "",
    maxPrice: "",
    vehicleType: "all",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [reservingTravel, setReservingTravel] = useState<number | null>(null)
  const [reservationStatus, setReservationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  // Efecto para cargar los datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        // Obtener el UID desde localStorage 
        const storedUser = localStorage.getItem("userData")
        let uid = null
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          uid = parsedUser.uid
        }
        if (!uid) {
          throw new Error("No se encontró el UID del usuario en localStorage.")
        }
        // Llama a la API 
        const response = await axios.get(`http://127.0.0.1:8000/api/users/profile/${uid}/`)

        // Ajusta los nombres de las propiedades según la respuesta real
        setUserData({
          uid: response.data.uid,
          fullName: response.data.full_name,
          userType: response.data.user_type,
          institutionalMail: response.data.institutional_mail,
          studentCode: response.data.student_code,
          institutionName: response.data.institution_name,
          driverState: response.data.driver_state, // si quieres mostrarlo
          // Si tienes otros campos personalizados en tu estado, agrégalos aquí
        })
        setLoading(false)
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error)
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Efecto para cargar los viajes disponibles
  useEffect(() => {
    const fetchTravels = async () => {
      try {
        // En una implementación real, esto sería una llamada a la API
        // const response = await axios.get('/api/travels/available');
        // setTravels(response.data);

        // Simulación de carga de datos basados en la estructura de la BD
        setTimeout(() => {
          const mockTravels: Travel[] = [
            {
              id_travel: 1,
              id_route: 1,
              id_vehicle: 1,
              id_driver: 1,
              id_user: 5,
              time: "14:30",
              travel_state: "active",
              price: 5000,
              route: {
                id_route: 1,
                origin: "Campus Principal",
                destination: "Terminal de Transporte",
                departure_time: "2025-05-20",
              },
              vehicle: {
                id_vehicle: 1,
                id_driver: 1,
                soat: "SOAT12345",
                plate: "ABC123",
                brand: "Toyota",
                model: "Corolla",
                vehicle_type: "Sedan",
                category: "Particular",
                technical_mechanical: "TM12345",
                capacity: 4,
              },
              driver: {
                id_driver: 1,
                full_name: "Carlos Rodríguez",
                rating: 4.8,
              },
              availableSeats: 3, // Calculado: capacidad - reservas
            },
            {
              id_travel: 2,
              id_route: 2,
              id_vehicle: 2,
              id_driver: 2,
              id_user: 6,
              time: "16:00",
              travel_state: "active",
              price: 4500,
              route: {
                id_route: 2,
                origin: "Biblioteca Central",
                destination: "Centro Comercial",
                departure_time: "2025-05-20",
              },
              vehicle: {
                id_vehicle: 2,
                id_driver: 2,
                soat: "SOAT67890",
                plate: "XYZ789",
                brand: "Honda",
                model: "CR-V",
                vehicle_type: "SUV",
                category: "Particular",
                technical_mechanical: "TM67890",
                capacity: 5,
              },
              driver: {
                id_driver: 2,
                full_name: "Ana Martínez",
                rating: 4.5,
              },
              availableSeats: 2,
            },
            {
              id_travel: 3,
              id_route: 3,
              id_vehicle: 3,
              id_driver: 3,
              id_user: 7,
              time: "17:30",
              travel_state: "active",
              price: 3500,
              route: {
                id_route: 3,
                origin: "Facultad de Ingeniería",
                destination: "Estación de Metro",
                departure_time: "2025-05-21",
              },
              vehicle: {
                id_vehicle: 3,
                id_driver: 3,
                soat: "SOAT24680",
                plate: "DEF456",
                brand: "Mazda",
                model: "3",
                vehicle_type: "Hatchback",
                category: "Particular",
                technical_mechanical: "TM24680",
                capacity: 4,
              },
              driver: {
                id_driver: 3,
                full_name: "Luis Gómez",
                rating: 4.9,
              },
              availableSeats: 4,
            },
            {
              id_travel: 4,
              id_route: 4,
              id_vehicle: 4,
              id_driver: 4,
              id_user: 8,
              time: "18:15",
              travel_state: "active",
              price: 4000,
              route: {
                id_route: 4,
                origin: "Cafetería Central",
                destination: "Parque Principal",
                departure_time: "2025-05-21",
              },
              vehicle: {
                id_vehicle: 4,
                id_driver: 4,
                soat: "SOAT13579",
                plate: "GHI789",
                brand: "Chevrolet",
                model: "Spark",
                vehicle_type: "Sedan",
                category: "Particular",
                technical_mechanical: "TM13579",
                capacity: 4,
              },
              driver: {
                id_driver: 4,
                full_name: "María López",
                rating: 4.7,
              },
              availableSeats: 1,
            },
            {
              id_travel: 5,
              id_route: 5,
              id_vehicle: 5,
              id_driver: 5,
              id_user: 9,
              time: "19:00",
              travel_state: "active",
              price: 6000,
              route: {
                id_route: 5,
                origin: "Gimnasio Universitario",
                destination: "Zona Residencial Norte",
                departure_time: "2025-05-22",
              },
              vehicle: {
                id_vehicle: 5,
                id_driver: 5,
                soat: "SOAT97531",
                plate: "JKL012",
                brand: "Kia",
                model: "Sportage",
                vehicle_type: "SUV",
                category: "Particular",
                technical_mechanical: "TM97531",
                capacity: 5,
              },
              driver: {
                id_driver: 5,
                full_name: "Pedro Sánchez",
                rating: 4.6,
              },
              availableSeats: 3,
            },
          ]
          setTravels(mockTravels)
          setFilteredTravels(mockTravels)
        }, 1500)
      } catch (error) {
        console.error("Error al cargar viajes:", error)
      }
    }

    fetchTravels()
  }, [])

  // Función para aplicar filtros
  const applyFilters = () => {
    let filtered = [...travels]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (travel) =>
          travel.route?.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          travel.route?.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
          travel.driver?.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrar por fecha
    if (filterOptions.date) {
      filtered = filtered.filter((travel) => travel.route?.departure_time === filterOptions.date)
    }

    // Filtrar por precio mínimo
    if (filterOptions.minPrice) {
      filtered = filtered.filter((travel) => travel.price >= Number.parseInt(filterOptions.minPrice))
    }

    // Filtrar por precio máximo
    if (filterOptions.maxPrice) {
      filtered = filtered.filter((travel) => travel.price <= Number.parseInt(filterOptions.maxPrice))
    }

    // Filtrar por tipo de vehículo
    if (filterOptions.vehicleType !== "all") {
      filtered = filtered.filter((travel) => travel.vehicle?.vehicle_type === filterOptions.vehicleType)
    }

    setFilteredTravels(filtered)
  }

  // Efecto para aplicar filtros cuando cambian las opciones
  useEffect(() => {
    applyFilters()
  }, [searchTerm, filterOptions])

  // Función para manejar la reserva de un viaje
  const handleReserveTravel = async (travelId: number) => {
    if (!userData) {
      alert("Debes iniciar sesión para reservar un viaje")
      return
    }

    setReservingTravel(travelId)
    setReservationStatus("loading")

    try {
      // En una implementación real, esto sería una llamada a la API
      // const response = await axios.post('/api/reservations', {
      //   id_user: userData.uid,
      //   id_travel: travelId,
      //   status: 'confirmed'
      // });

      // Simulación de reserva exitosa
      setTimeout(() => {
        // Actualizar los asientos disponibles en el viaje reservado
        const updatedTravels = travels.map((travel) => {
          if (travel.id_travel === travelId && travel.availableSeats && travel.availableSeats > 0) {
            return {
              ...travel,
              availableSeats: travel.availableSeats - 1,
            }
          }
          return travel
        })

        setTravels(updatedTravels)
        applyFilters() // Actualizar los viajes filtrados
        setReservationStatus("success")

        // Mostrar mensaje de éxito
        alert("¡Viaje reservado con éxito! Puedes ver los detalles en tu historial de viajes.")

        // Resetear el estado
        setTimeout(() => {
          setReservingTravel(null)
          setReservationStatus("idle")
        }, 2000)
      }, 1500)
    } catch (error) {
      console.error("Error al reservar viaje:", error)
      setReservationStatus("error")
      alert("No se pudo completar la reserva. Por favor, inténtalo de nuevo.")

      // Resetear el estado
      setTimeout(() => {
        setReservingTravel(null)
        setReservationStatus("idle")
      }, 2000)
    }
  }

  // Función para manejar la aplicación para ser conductor
  const handleDriverApplication = async () => {
    if (!userData) {
      alert("Error: No se pudo obtener la información del usuario")
      return
    }

    try {
      const response = await axios.post(
        `http://localhost:8000/api/users/apply-driver/${userData.uid}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        },
      )

      if (response.status === 200) {
        alert("¡Tu solicitud para ser conductor ha sido enviada exitosamente! Te notificaremos cuando sea revisada.")

        // Actualizar el estado local del usuario para reflejar que ya aplicó
        setUserData((prev) => (prev ? { ...prev, hasAppliedDriver: true } : null))
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          alert("Ya has enviado una solicitud para ser conductor anteriormente.")
        } else if (error.response?.status === 404) {
          alert("Usuario no encontrado.")
        } else {
          alert("Error al enviar la solicitud. Por favor, inténtalo de nuevo.")
        }
        console.error("Error al aplicar para conductor:", error.response?.data || error.message)
      } else {
        alert("Error inesperado. Por favor, inténtalo de nuevo.")
        console.error("Error inesperado:", error)
      }
    }
  }

  // Función para cerrar sesión
  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      // Eliminar tokens y datos del usuario
      localStorage.removeItem("userToken")
      localStorage.removeItem("userData")

      // Redireccionar al inicio
      navigate("/")
    }
  }

  // Función para navegar a la gestión de vehículos (solo para conductores)
  const navigateToVehicleManagement = () => {
    navigate("/gestion-vehiculos")
  }

  // Renderizado condicional basado en el estado de carga
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando información...</p>
      </div>
    )
  }

  return (
    <div className="user-dashboard">
      {/* Barra lateral */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Uguee</h2>
        </div>

        <div className="user-profile">
          <div className="user-avatar">
            <span>{userData?.fullName ? userData.fullName.charAt(0) : "U"}</span>
          </div>
          <div className="user-info">
            <h3>{userData?.fullName || "Usuario"}</h3>
            <p>{userData?.institutionName || ""}</p>
            <span className={`user-type ${userData?.userType}`}>
              {userData?.userType === "student"
                ? "Estudiante"
                : userData?.userType === "admin"
                  ? "Administrativo"
                  : userData?.userType === "teacher"
                    ? "Profesor"
                    : "Usuario"}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-button ${activeTab === "trips" ? "active" : ""}`}
            onClick={() => setActiveTab("trips")}
          >
            <List size={20} />
            <span>Viajes Disponibles</span>
          </button>
          <button className={`nav-button ${activeTab === "map" ? "active" : ""}`} onClick={() => setActiveTab("map")}>
            <MapIcon size={20} />
            <span>Mapa en Tiempo Real</span>
          </button>
        </nav>

        <div className="sidebar-actions">
          {userData?.driverState ? (
            <button className="action-button primary" onClick={navigateToVehicleManagement}>
              <Car size={18} />
              <span>Gestionar Vehículos</span>
              <ChevronRight size={16} />
            </button>
          ) : userData?.hasAppliedDriver ? (
            <button className="action-button secondary" disabled>
              <Car size={18} />
              <span>Solicitud Enviada</span>
            </button>
          ) : (
            <button className="action-button secondary" onClick={handleDriverApplication}>
              <Car size={18} />
              <span>Aplicar para ser Conductor</span>
              <ChevronRight size={16} />
            </button>
          )}

          <button className="action-button logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="dashboard-content">
        <header className="content-header">
          <h1>{activeTab === "trips" ? "Viajes Disponibles" : "Mapa de Vehículos en Tiempo Real"}</h1>
          <div className="header-actions">
            <div className="search-container">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar por origen, destino o conductor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className={`filter-button ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              <span>Filtros</span>
            </button>
          </div>
        </header>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="filter-panel">
            <div className="filter-group">
              <label htmlFor="date-filter">Fecha</label>
              <input
                type="date"
                id="date-filter"
                value={filterOptions.date}
                onChange={(e) => setFilterOptions({ ...filterOptions, date: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="min-price">Precio Mínimo</label>
              <input
                type="number"
                id="min-price"
                placeholder="Mínimo"
                value={filterOptions.minPrice}
                onChange={(e) => setFilterOptions({ ...filterOptions, minPrice: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="max-price">Precio Máximo</label>
              <input
                type="number"
                id="max-price"
                placeholder="Máximo"
                value={filterOptions.maxPrice}
                onChange={(e) => setFilterOptions({ ...filterOptions, maxPrice: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="vehicle-type">Tipo de Vehículo</label>
              <select
                id="vehicle-type"
                value={filterOptions.vehicleType}
                onChange={(e) => setFilterOptions({ ...filterOptions, vehicleType: e.target.value })}
              >
                <option value="all">Todos</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Pickup">Pickup</option>
              </select>
            </div>

            <button
              className="clear-filters"
              onClick={() => {
                setFilterOptions({
                  date: "",
                  minPrice: "",
                  maxPrice: "",
                  vehicleType: "all",
                })
                setSearchTerm("")
              }}
            >
              Limpiar Filtros
            </button>
          </div>
        )}

        {/* Contenido basado en la pestaña activa */}
        {activeTab === "trips" ? (
          <div className="trips-container">
            {filteredTravels.length > 0 ? (
              <div className="trips-grid">
                {filteredTravels.map((travel) => (
                  <div key={travel.id_travel} className="trip-card">
                    <div className="trip-header">
                      <div className="trip-route">
                        <div className="origin">
                          <MapPin size={16} />
                          <span>{travel.route?.origin}</span>
                        </div>
                        <div className="route-arrow">→</div>
                        <div className="destination">
                          <MapPin size={16} />
                          <span>{travel.route?.destination}</span>
                        </div>
                      </div>
                    </div>

                    <div className="trip-details">
                      <div className="detail-item">
                        <Clock size={16} />
                        <span>{travel.time}</span>
                      </div>
                      <div className="detail-item">
                        <Calendar size={16} />
                        <span>{new Date(travel.route?.departure_time || "").toLocaleDateString()}</span>
                      </div>
                      <div className="detail-item">
                        <User size={16} />
                        <span>{travel.driver?.full_name}</span>
                      </div>
                      <div className="detail-item">
                        <Car size={16} />
                        <span>{travel.vehicle?.vehicle_type}</span>
                      </div>
                      <div className="detail-item">
                        <Star size={16} />
                        <span>{travel.driver?.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="trip-footer">
                      <div className="trip-price">${travel.price.toLocaleString()}</div>
                      <div className="trip-seats">
                        <span>{travel.availableSeats}</span> asientos disponibles
                      </div>
                      <button
                        className={`reserve-button ${reservingTravel === travel.id_travel ? reservationStatus : ""}`}
                        onClick={() => handleReserveTravel(travel.id_travel)}
                        disabled={
                          reservingTravel === travel.id_travel || !travel.availableSeats || travel.availableSeats <= 0
                        }
                      >
                        {reservingTravel === travel.id_travel
                          ? reservationStatus === "loading"
                            ? "Reservando..."
                            : reservationStatus === "success"
                              ? "¡Reservado!"
                              : "Error"
                          : travel.availableSeats && travel.availableSeats > 0
                            ? "Reservar"
                            : "No disponible"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-trips">
                <p>No se encontraron viajes que coincidan con los criterios de búsqueda.</p>
                <button
                  className="clear-filters"
                  onClick={() => {
                    setFilterOptions({
                      date: "",
                      minPrice: "",
                      maxPrice: "",
                      vehicleType: "all",
                    })
                    setSearchTerm("")
                  }}
                >
                  Limpiar Filtros
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="map-container">
            <div className="map-placeholder">
              <MapIcon size={48} />
              <h3>Mapa en Tiempo Real</h3>
              <p>
                Aquí se mostrará un mapa interactivo con la ubicación y disponibilidad de los vehículos en tiempo real.
              </p>
              <p className="map-note">
                Esta funcionalidad estará disponible próximamente. Estamos trabajando para ofrecerte la mejor
                experiencia de viaje.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default UserDashboard
