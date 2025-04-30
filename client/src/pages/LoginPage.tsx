import React, { useState } from "react";
import Header from "../components/Header.tsx";
import "../styles/LoginSignup.css";
import axios from "axios";

const LoginPage: React.FC = () => {
  const [isToggle, setIsToggle] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/login", loginData); // 👉 tu endpoint
      console.log("Login:", response.data);
    } catch (error) {
      console.error("Error de login:", error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/register", registerData); // 👉 tu endpoint
      console.log("Registro:", response.data);
    } catch (error) {
      console.error("Error de registro:", error);
    }
  };

  return (
    <>
      {/* Ionicons CDN */}
      <script
        type="module"
        src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"
      ></script>
      <script
        noModule
        src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"
      ></script>

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
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                />
              </div>
              <div className="container-input">
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                />
              </div>
              <a href="#">¿Olvidaste tu contraseña?</a>
              <button className="button">INICIAR SESIÓN</button>
            </form>
          </div>

          {/* Inicio de sesion institucion */}
          <div className="container-form">
            <form className="sign-up" onSubmit={handleRegister}>
              <h2>Iniciar Sesión</h2>
              <div className="social-networks"></div>
              <span></span>
              <div className="container-input">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={registerData.name}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, name: e.target.value })
                  }
                />
              </div>
              <div className="container-input">
                <input
                  type="text"
                  placeholder="Email"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, email: e.target.value })
                  }
                />
              </div>
              <div className="container-input">
                <input
                  type="password"
                  placeholder="Password"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                />
              </div>
              <button className="button">INICIAR SESION</button>
            </form>
          </div>

          <div className="container-welcome">
            <div className="welcome-sign-up welcome">
              <h3>¡Hola!</h3>
              <p>
                Ingrese sus datos personales para usar todas las funciones del
                sitio
              </p>
              <button className="button" onClick={() => setIsToggle(true)}>
                ¿Eres una institucion?
              </button>
            </div>
            <div className="welcome-sign-in welcome">
              <h3>¡Bienvenido!</h3>
              <p>
                Ingrese los datos de su institucion
                para poder administrarla
              </p>
              <button className="button" onClick={() => setIsToggle(false)}>
                ¿Eres un usuario?
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
