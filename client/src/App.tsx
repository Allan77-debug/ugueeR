import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "./features/home/pages/HomePage";
import InstitutionRegisterPage from "./features/institution/pages/InstitutionRegisterPage";
import UserRegisterPage from "./features/users/pages/UserRegisterPage";
import UserDashboard from "./features/users/pages/UserDashboard";
import AdminPanel from "./features/admin/pages/AdminPanel";
import Login from "./features/auth/pages/LoginPage";
import LoginAdmin from "./features/auth/pages/LoginAdmin";
import InstitutionDashboard from "./features/institution/pages/InstitutionDashboard";
import DriverPageLayout from "./features/driver/components/layout/DriverPageLayout";
import DriverProtectedRoute from "./features/driver/components/DriverProtectedRoute";
import { driverDashboardRoutes } from "./features/driver/driver.Routes";
import authService from "./services/authService";

// Componente para proteger rutas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("adminToken") !== null;

  if (!isAuthenticated) {
    return <Navigate to="/login-admin" replace />;
  }

  return <>{children}</>;
};

const UserProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Para desarrollo permitimos el acceso sin token
    // En produccion toca descomentar la lnea:
    // return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para proteger rutas de institución
const InstitutionProtectedRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isAuthenticated = localStorage.getItem("institutionToken") !== null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route
          path="/registro-institucion"
          element={<InstitutionRegisterPage />}
        />
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

        {/* Rutas protegidas del Conductor */}
        <Route
          path="/driver/*" // El path base para el módulo del conductor
          element={
            <DriverProtectedRoute>
              {/*
                 Aquí renderizamos directamente el layout que tiene el Outlet,
                 y React Router se encarga de los children definidos en driverDashboardRoutes
              */}
              <DriverPageLayout />
            </DriverProtectedRoute>
          }
        >
          {/* Definimos las rutas hijas directamente aquí, usando los children de driverDashboardRoutes */}
          {driverDashboardRoutes[0].children?.map((childRoute, childIndex) => (
            <Route
              key={`driver-child-${childRoute.path || childIndex}`}
              index={childRoute.index}
              path={childRoute.path}
              element={childRoute.element}
            />
          ))}
          {/* Opcional: un fallback dentro del driver dashboard si ninguna sub-ruta coincide */}
          <Route path="*" element={<Navigate to="my-routes" replace />} />
        </Route>

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
  );
}

export default App;
