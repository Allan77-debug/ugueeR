import { Navigate } from "react-router-dom";

interface DriverProtectedRouteProps {
  children: React.ReactNode;
}

const DriverProtectedRoute: React.FC<DriverProtectedRouteProps> = ({ children }) => {
  const storedUser = localStorage.getItem("userData");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // Si no está logueado o no es conductor aprobado, redirige al inicio
  if (!user || user.driverState !== "aprobado") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default DriverProtectedRoute;