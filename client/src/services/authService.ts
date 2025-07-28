// Servicio de autenticación para manejo centralizado de tokens

export const authService = {
  // Obtener el token de acceso
  getAccessToken: (): string | null => {
    return localStorage.getItem("accessToken");
  },

  // Obtener el token de usuario (compatibilidad)
  getUserToken: (): string | null => {
    return localStorage.getItem("userToken");
  },

  // Obtener el token de institución
  getInstitutionToken: (): string | null => {
    return localStorage.getItem("institutionToken");
  },

  // Obtener cualquier token válido
  getToken: (): string | null => {
    return authService.getAccessToken() || authService.getUserToken();
  },

  // Guardar tokens de usuario
  setTokens: (token: string): void => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("userToken", token); // Para compatibilidad
  },

  // Guardar token de institución
  setInstitutionToken: (token: string): void => {
    localStorage.setItem("institutionToken", token);
  },

  // Guardar datos del usuario
  setUserData: (userData: Record<string, unknown>): void => {
    localStorage.setItem("userData", JSON.stringify(userData));
  },

  // Guardar datos de la institución
  setInstitutionData: (institutionData: Record<string, unknown>): void => {
    localStorage.setItem("institutionData", JSON.stringify(institutionData));
  },

  // Obtener datos del usuario
  getUserData: (): Record<string, unknown> | null => {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  },

  // Obtener datos de la institución
  getInstitutionData: (): Record<string, unknown> | null => {
    const institutionData = localStorage.getItem("institutionData");
    return institutionData ? JSON.parse(institutionData) : null;
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: (): boolean => {
    return authService.getToken() !== null;
  },

  // Verificar si la institución está autenticada
  isInstitutionAuthenticated: (): boolean => {
    return authService.getInstitutionToken() !== null;
  },

  // Limpiar toda la sesión
  logout: (): void => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("institutionToken");
    localStorage.removeItem("institutionData");
  },

  // Obtener headers de autenticación para usuarios
  getAuthHeaders: (): { [key: string]: string } => {
    const token = authService.getToken();
    if (!token) return { "Content-Type": "application/json" };

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  },

  // Obtener headers de autenticación para instituciones
  getInstitutionAuthHeaders: (): { [key: string]: string } => {
    const token = authService.getInstitutionToken();
    if (!token) return { "Content-Type": "application/json" };

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  },
};

export default authService;
