"use client"
import { useState, useEffect } from "react"
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
  Sun,
  Moon,
} from "lucide-react"
import "../styles/UserDashboard.css"
import axios from "axios"
import RealTimeMap from "../components/RealTimeMap"
import authService from "../../../services/authService"

// Interfaces basadas en la estructura de la API
interface UserData {
  uid: number
  fullName: string
  userType: string
  institutionalMail: string
  studentCode: string
  institutionName?: string
  hasAppliedDriver?: boolean
  driverState?: string
}

interface UserForDriver {
  id: number
  full_name: string
  institutional_mail: string
  student_code: string
  user_type: string
}

interface Driver {
  user: UserForDriver
  validate_state: string
}

interface TravelVehicleInfo {
  id: number
  plate: string
  brand: string
  model: string
  vehicle_type: string
  category: string
  soat: string
  tecnomechanical: string
  capacity: number
  driver: number
}

interface Travel {
  id: number
  time: string // Hora específica del viaje en formato ISO
  travel_state: string // Estado del viaje (activo, cancelado, completado)
  price: number // Campo para el precio
  driver: Driver
  vehicle: TravelVehicleInfo
  driver_score: string
  available_seats: string
  // Campos computados para compatibilidad con la UI existente
  route?: {
    origin: string
    destination: string
    departure_time: string
  }
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

  // Estado para el tema
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("userDashboardTheme")
    return savedTheme ? savedTheme === "dark" : true // Por defecto modo oscuro
  })

  // Efecto para aplicar el tema y guardarlo
  useEffect(() => {
    const dashboardElement = document.querySelector(".user-dashboard")
    if (dashboardElement) {
      if (isDarkMode) {
        dashboardElement.classList.add("dark-theme")
        dashboardElement.classList.remove("light-theme")
      } else {
        dashboardElement.classList.add("light-theme")
        dashboardElement.classList.remove("dark-theme")
      }
    }
    localStorage.setItem("userDashboardTheme", isDarkMode ? "dark" : "light")
  }, [isDarkMode])

  // Función para alternar el tema
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

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
        const updatedUserData = {
          uid: response.data.uid,
          fullName: response.data.full_name,
          userType: response.data.user_type,
          institutionalMail: response.data.institutional_mail,
          studentCode: response.data.student_code,
          institutionName: response.data.institution_name,
          driverState: response.data.driver_state, // si quieres mostrarlo
          // Si tienes otros campos personalizados en tu estado, agrégalos aquí
        }

        setUserData(updatedUserData)

        // IMPORTANTE: Actualizar localStorage con los datos completos incluyendo driverState
        localStorage.setItem("userData", JSON.stringify(updatedUserData))

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
        const response = await axios.get('http://127.0.0.1:8000/api/travel/institution/', {
          headers: authService.getAuthHeaders(),
        })

        // Procesar los datos de la API para que sean compatibles con la UI existente
        const processedTravels: Travel[] = response.data.map((travel: Omit<Travel, 'route' | 'availableSeats'>) => ({
          ...travel,
          // Convertir available_seats de string a número
          availableSeats: parseInt(travel.available_seats) || 0,
          // Crear un objeto route simulado para compatibilidad con la UI
          route: {
            origin: "Campus", // Valores por defecto, podrías obtenerlos de otra API
            destination: "Destino",
            departure_time: new Date(travel.time).toISOString().split('T')[0],
          },
        }))

        setTravels(processedTravels)
        setFilteredTravels(processedTravels)
      } catch (error) {
        console.error("Error al cargar viajes desde la API:", error)
        
        // Fallback a datos simulados en caso de error
        const mockTravels: Travel[] = [
          {
            id: 1,
            time: "2025-05-20T14:30:00Z",
            travel_state: "active",
            price: 5000,
            driver: {
              user: {
                id: 1,
                full_name: "Carlos Rodríguez",
                institutional_mail: "carlos@universidad.edu",
                student_code: "20191001",
                user_type: "student",
              },
              validate_state: "approved",
            },
            vehicle: {
              id: 1,
              plate: "ABC123",
              brand: "Toyota",
              model: "Corolla",
              vehicle_type: "Sedan",
              category: "Particular",
              soat: "SOAT12345",
              tecnomechanical: "TM12345",
              capacity: 4,
              driver: 1,
            },
            driver_score: "4.8",
            available_seats: "3",
            route: {
              origin: "Campus Principal",
              destination: "Terminal de Transporte",
              departure_time: "2025-05-20",
            },
            availableSeats: 3,
          },
          {
            id: 2,
            time: "2025-05-20T16:00:00Z",
            travel_state: "active",
            price: 4500,
            driver: {
              user: {
                id: 2,
                full_name: "Ana Martínez",
                institutional_mail: "ana@universidad.edu",
                student_code: "20191002",
                user_type: "student",
              },
              validate_state: "approved",
            },
            vehicle: {
              id: 2,
              plate: "XYZ789",
              brand: "Honda",
              model: "CR-V",
              vehicle_type: "SUV",
              category: "Particular",
              soat: "SOAT67890",
              tecnomechanical: "TM67890",
              capacity: 5,
              driver: 2,
            },
            driver_score: "4.5",
            available_seats: "2",
            route: {
              origin: "Biblioteca Central",
              destination: "Centro Comercial",
              departure_time: "2025-05-20",
            },
            availableSeats: 2,
          },
        ]
        
        setTravels(mockTravels)
        setFilteredTravels(mockTravels)
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
          travel.driver?.user?.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
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
          if (travel.id === travelId && travel.availableSeats && travel.availableSeats > 0) {
            return {
              ...travel,
              availableSeats: travel.availableSeats - 1,
              available_seats: (travel.availableSeats - 1).toString(),
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
        const updatedUserData = { ...userData, hasAppliedDriver: true }
        setUserData(updatedUserData)

        // IMPORTANTE: Actualizar localStorage con el estado actualizado
        localStorage.setItem("userData", JSON.stringify(updatedUserData))
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
      // Usar el servicio de auth para limpiar la sesión
      authService.logout()

      // Redireccionar al inicio
      navigate("/")
    }
  }

  // Función para navegar a la gestión de rutas del conductor
  const navigateToVehicleManagement = () => {
    navigate("/driver")
  }

  // Renderizado condicional basado en el estado de carga
  if (loading) {
    return (
      <div className={`loading-container ${isDarkMode ? "dark-theme" : "light-theme"}`}>
        <div className="loading-spinner"></div>
        <p>Cargando información...</p>
      </div>
    )
  }

  return (
    <div className={`user-dashboard ${isDarkMode ? "dark-theme" : "light-theme"}`}>
      {/* Barra lateral */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="header-top">
            <h2>Uway</h2>
            {/* Toggle de tema */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
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
                  <div key={travel.id} className="trip-card">
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
                        <span>{new Date(travel.time).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</span>
                      </div>
                      <div className="detail-item">
                        <Calendar size={16} />
                        <span>{new Date(travel.time).toLocaleDateString('es-ES')}</span>
                      </div>
                      <div className="detail-item">
                        <User size={16} />
                        <span>{travel.driver?.user?.full_name}</span>
                      </div>
                      <div className="detail-item">
                        <Car size={16} />
                        <span>{travel.vehicle?.vehicle_type}</span>
                      </div>
                      <div className="detail-item">
                        <Star size={16} />
                        <span>{travel.driver_score}</span>
                      </div>
                    </div>

                    <div className="trip-footer">
                      <div className="trip-price">${travel.price.toLocaleString()}</div>
                      <div className="trip-seats">
                        <span>{travel.availableSeats}</span> asientos disponibles
                      </div>
                      <button
                        className={`reserve-button ${reservingTravel === travel.id ? reservationStatus : ""}`}
                        onClick={() => handleReserveTravel(travel.id)}
                        disabled={
                          reservingTravel === travel.id || !travel.availableSeats || travel.availableSeats <= 0
                        }
                      >
                        {reservingTravel === travel.id
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
            <RealTimeMap />
          </div>
        )}
      </main>
    </div>
  )
}

export default UserDashboard
