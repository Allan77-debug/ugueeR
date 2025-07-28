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

  // Obtener cualquier token válido
  getToken: (): string | null => {
    return authService.getAccessToken() || authService.getUserToken();
  },

  // Guardar tokens
  setTokens: (token: string): void => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("userToken", token); // Para compatibilidad
  },

  // Guardar datos del usuario
  setUserData: (userData: Record<string, unknown>): void => {
    localStorage.setItem("userData", JSON.stringify(userData));
  },

  // Obtener datos del usuario
  getUserData: (): Record<string, unknown> | null => {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: (): boolean => {
    return authService.getToken() !== null;
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

  // Obtener headers de autenticación
  getAuthHeaders: (): { [key: string]: string } => {
    const token = authService.getToken();
    if (!token) return { "Content-Type": "application/json" };

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  },
};

export default authService;
