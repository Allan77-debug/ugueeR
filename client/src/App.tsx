import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import HomePage from "./pages/HomePage"
import InstitutionRegisterPage from "./pages/InstitutionRegisterPage"
import UserRegisterPage from "./pages/UserRegisterPage"
import UserDashboard from "./pages/UserDashboard"
import AdminPanel from "./pages/AdminPanel"
import Login from "./pages/LoginPage"
import LoginAdmin from "./pages/LoginAdmin"

// Componente para proteger rutas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("adminToken") !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login-admin" replace />;
  }
  
  return <>{children}</>;
};

const UserProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("userToken") !== null

  if (!isAuthenticated) {
    // Para desarrollo permitimos el acceso sin token
    // En produccion toca descomentar la lnea:
    // return <Navigate to="/login" replace />;
  }

  return <>{children}</>
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/registro-institucion" element={<InstitutionRegisterPage />} />
        <Route path="/registro-usuario" element={<UserRegisterPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login-admin" element={<LoginAdmin />} />

        {/* Rutas protegidas de usuario */}
        <Route
          path="/dashboard"
          element={
            <UserProtectedRoute>
              <UserDashboard />
            </UserProtectedRoute>
          }
        />
        
        {/* Rutas protegidas */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta de fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App