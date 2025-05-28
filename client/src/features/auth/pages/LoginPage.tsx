"use client"

import type React from "react"
import { useState } from "react"
import Header from "../../../components/Header.tsx"
import "../styles/LoginSignup.css"
import axios from "axios"

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
      console.log("Login:", response.data)
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

      // Guardar token de institución
      localStorage.setItem("institutionToken", "fake-institution-token-123")
      localStorage.setItem(
        "institutionData",
        JSON.stringify({
          id_institution: 1,
          official_name: response.data.institution_name || "Universidad Nacional",
          short_name: response.data.short_name || "UNAL",
          email: registerData.email,
        }),
      )

      // Redireccionar al dashboard de institución
      window.location.href = "/institucion-dashboard"
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const responseData = error.response.data

        if (responseData.error) {
          setRegisterError(responseData.error)
        } else {
          setRegisterError("Error al iniciar sesión. Verifique sus datos.")
        }
      } else {
        setRegisterError("Error de conexión. Por favor, verifique su internet.")
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
