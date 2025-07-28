"use client"

import React from "react"
import { useState } from "react"
import Header from "../../../components/Header.tsx"
import "../styles/LoginSignup.css"
import axios from "axios"
import authService from "../../../services/authService"

const LoginPage: React.FC = () => {
  const [isToggle, setIsToggle] = useState(false)
  const [loginData, setLoginData] = useState({
    institutional_mail: "",
    upassword: "",
  })
  const [registerData, setRegisterData] = useState({
    email: "",
    ipassword: "",
  })

  // Estados para los mensajes de error y carga
  const [loginError, setLoginError] = useState("")
  const [registerError, setRegisterError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("") // Limpiar errores previos
    setIsLoading(true)

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/users/login/", loginData)
      console.log("Login response:", response.data)
      
      // Extraer el token JWT de la respuesta
      const token = response.data.access || response.data.token || response.data.access_token
      
      if (token) {
        // Usar el servicio de auth para guardar tokens
        authService.setTokens(token)
        console.log("Token JWT guardado:", token)
      } else {
        console.warn("No se encontró token en la respuesta del login")
      }

      // Guardar los datos del usuario usando el servicio de auth
      authService.setUserData(response.data)

      alert("¡Inicio de sesión exitoso!")
      window.location.href = "/dashboard"
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Mensaje de error específico del servidor
        const responseData = error.response.data

        if (error.response.status === 404) {
          setLoginError("Usuario no encontrado. Por favor, verifique su correo.")
        } else if (error.response.status === 401) {
          setLoginError("Contraseña incorrecta. Por favor, inténtelo de nuevo.")
        } else if (error.response.status === 400) {
          // Errores de validación
          if (responseData.institutional_mail) {
            setLoginError(responseData.institutional_mail[0])
          } else if (responseData.upassword) {
            setLoginError(responseData.upassword[0])
          } else if (responseData.error) {
            setLoginError(responseData.error)
          } else {
            setLoginError("Por favor, complete correctamente todos los campos.")
          }
        } else {
          setLoginError("Error en el servidor. Por favor, inténtelo más tarde.")
        }
      }
      console.error("Error de login:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInstitution = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError("") // Limpiar errores previos
    setIsLoading(true)

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/institutions/login/", registerData)
      console.log("Inicio de sesión institución:", response.data)

      if (response.status === 200) {
        // Extraer el token JWT de la respuesta (similar al login de usuarios)
        const token = response.data.access || response.data.token || response.data.access_token
        
        if (token) {
          // Guardar el token JWT de la institución usando authService
          authService.setInstitutionToken(token)
          console.log("Token JWT de institución guardado:", token)
        } else {
          console.warn("No se encontró token JWT en la respuesta de la institución")
          // Fallback al token anterior si no hay JWT
          const fallbackToken = response.data.token || "fake-institution-token-123"
          authService.setInstitutionToken(fallbackToken)
        }
        
        // Obtener los datos de la institución de la respuesta
        const institutionData = {
          id_institution: response.data.id_institution || response.data.id,
          official_name: response.data.official_name || response.data.name,
          short_name: response.data.short_name || response.data.short_name,
          email: response.data.email || registerData.email
        }
        
        // Guardar datos de la institución usando authService
        authService.setInstitutionData(institutionData)

        alert("¡Inicio de sesión de institución exitoso!")
        // Redireccionar al dashboard de institución
        window.location.href = "/institucion-dashboard"
      } else {
        setRegisterError("Error al iniciar sesión")
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Manejo de errores similar al login de usuarios
        const responseData = error.response.data

        if (error.response.status === 404) {
          setRegisterError("Institución no encontrada. Por favor, verifique su correo.")
        } else if (error.response.status === 401) {
          setRegisterError("Contraseña incorrecta. Por favor, inténtelo de nuevo.")
        } else if (error.response.status === 400) {
          // Errores de validación
          if (responseData.email) {
            setRegisterError(responseData.email[0])
          } else if (responseData.ipassword) {
            setRegisterError(responseData.ipassword[0])
          } else if (responseData.error) {
            setRegisterError(responseData.error)
          } else {
            setRegisterError("Por favor, complete correctamente todos los campos.")
          }
        } else {
          setRegisterError("Error en el servidor. Por favor, inténtelo más tarde.")
        }
      } else {
        setRegisterError("Error de conexión. Por favor, inténtelo más tarde.")
      }
      console.error("Error de inicio de sesión institución:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Ionicons CDN */}
      <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
      <script noModule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>

      <Header />

      <div className="login-container">
        <div className={`container ${isToggle ? "toggle" : ""}`}>
          {/* Inicio de sesion institucion */}
          <div className="container-form">
            <form className="sign-in" onSubmit={handleLogin}>
              <h2>Iniciar Sesión</h2>
              <div className="social-networks"></div>
              <span>Use sus datos de usuario</span>
              <div className="container-input">
                <input
                  type="text"
                  placeholder="Email"
                  value={loginData.institutional_mail}
                  onChange={(e) =>
                    setLoginData({
                      ...loginData,
                      institutional_mail: e.target.value,
                    })
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="container-input">
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.upassword}
                  onChange={(e) => setLoginData({ ...loginData, upassword: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              {loginError && <p className="error-message">{loginError}</p>}

              <a href="#">¿Olvidaste tu contraseña?</a>
              <button className="button" disabled={isLoading}>
                {isLoading ? "CARGANDO..." : "INICIAR SESIÓN"}
              </button>
            </form>
          </div>

          {/* Inicio de sesion institucion */}
          <div className="container-form">
            <form className="sign-up" onSubmit={handleInstitution}>
              <h2>Iniciar Sesión</h2>
              <div className="social-networks"></div>
              <span></span>
              <div className="container-input">
                <input
                  type="text"
                  placeholder="Email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                />
              </div>
              <div className="container-input">
                <input
                  type="password"
                  placeholder="Password"
                  value={registerData.ipassword}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      ipassword: e.target.value,
                    })
                  }
                />
              </div>
              {registerError && <p className="error-message">{registerError}</p>}

              <button className="button" disabled={isLoading}>
                {isLoading ? "CARGANDO..." : "INICIAR SESIÓN"}
              </button>
            </form>
          </div>

          <div className="container-welcome">
            <div className="welcome-sign-up welcome">
              <h3>¡Hola!</h3>
              <p>Ingrese sus datos personales para usar todas las funciones del sitio</p>
              <button className="button" onClick={() => setIsToggle(true)}>
                ¿Eres una institucion?
              </button>
            </div>
            <div className="welcome-sign-in welcome">
              <h3>¡Bienvenido!</h3>
              <p>Ingrese los datos de su institucion para poder administrarla</p>
              <button className="button" onClick={() => setIsToggle(false)}>
                ¿Eres un usuario?
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage
