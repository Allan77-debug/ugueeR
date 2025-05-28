import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import HomePage from "./features/home/pages/HomePage"
import InstitutionRegisterPage from "./features/institution/pages/InstitutionRegisterPage"
import UserRegisterPage from "./features/users/pages/UserRegisterPage"
import UserDashboard from "./features/users/pages/UserDashboard"
import AdminPanel from "./features/admin/pages/AdminPanel"
import Login from "./features/auth/pages/LoginPage"
import LoginAdmin from "./features/auth/pages/LoginAdmin"
import InstitutionDashboard from "./features/institution/pages/InstitutionDashboard"

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

// Componente para proteger rutas de institución
const InstitutionProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("institutionToken") !== null

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
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
        
        {/* Rutas protegidas de institución */}
        <Route
          path="/institucion-dashboard"
          element={
            <InstitutionProtectedRoute>
              <InstitutionDashboard />
            </InstitutionProtectedRoute>
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