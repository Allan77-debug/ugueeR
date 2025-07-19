import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // ---SECCIÓN DE PROXY ---
    proxy: {
      // Si una petición del frontend empieza con '/api',
      // Vite la redirigirá al servidor de Django.
      "/api": {
        target: "http://127.0.0.1:8000", // La dirección de tu backend
        changeOrigin: true, // Necesario para evitar problemas de CORS
        secure: false, // Si tu backend no usa HTTPS
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  publicDir: path.resolve(__dirname, "./public"),
});
