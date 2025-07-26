// client/src/services/api.ts
import axios from 'axios';

// ¡ESTA ES LA LÍNEA QUE DEBES CAMBIAR!
// Usa la IP de tu PC en la red local.
const API_BASE_URL = 'http://10.168.58.145:8000/api'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// (Opcional pero útil) Puedes añadir interceptores aquí para manejar tokens de autenticación
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken'); // o el nombre de tu token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;