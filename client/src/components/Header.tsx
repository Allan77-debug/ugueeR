import React from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <h1>Uguee</h1>
        </Link>
      </div>
      <nav className="nav">
        <Link to="/registro-institucion" className="nav-link">
          Registro institución
        </Link>
        <Link to="/registro-usuario" className="nav-link">
          Registro usuario
        </Link>
        <Link to="/login" className="nav-link">
          Iniciar sesion
        </Link>
      </nav>
    </header>
  );
};

export default Header;
