import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('adminToken') !== null;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login-admin');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/login-admin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;