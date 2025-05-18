import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header.tsx";
import "../styles/LoginAdmin.css";
import axios from "axios";

const LoginAdmin: React.FC = () => {
  const [isToggle] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Verificar si ya está autenticado
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/admins/login/",
        loginData
      );
      console.log("Login:", response.data);

      // Guardar el token en localStorage
      localStorage.setItem(
        "adminToken",
        response.data.token || "admin-token-placeholder"
      );
      localStorage.setItem(
        "adminUser",
        JSON.stringify({
          email: loginData.email,
          role: "admin",
        })
      );

      // Redireccionar al panel de administración
      navigate("/admin");
    } catch (error) {
      console.error("Error de login:", error);
      setError("Credenciales incorrectas. Por favor intente de nuevo.");
    } finally {
      setLoading(false);
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

      <div className="admin-login-container">
        <div className={`admin-container ${isToggle ? "toggle" : ""}`}>
          <div className="wave"></div>
          {/* Inicio de sesion Administrador */}
          <div className="admin-container-form">
            <form className="admin-sign-in" onSubmit={handleLogin}>
              <h2>Iniciar Sesión</h2>
              <div className="social-networks"></div>
              <span>Use sus datos de administrador</span>
              <div className="admin-container-input">
                <input
                  type="text"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="admin-container-input">
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <button className="admin-button" disabled={loading}>
                {loading ? "CARGANDO..." : "INICIAR SESIÓN"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginAdmin;
