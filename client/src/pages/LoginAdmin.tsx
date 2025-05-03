import React, { useState } from "react";
import Header from "../components/Header.tsx";
import "../styles/LoginAdmin.css";
import axios from "axios";

const LoginAdmin: React.FC = () => {
  const [isToggle] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/login", loginData); // 👉 tu endpoint
      console.log("Login:", response.data);
    } catch (error) {
      console.error("Error de login:", error);
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
                />
              </div>
              <button className="admin-button">INICIAR SESIÓN</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginAdmin;
