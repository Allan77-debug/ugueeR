// client/vite.config.ts

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import basicSsl from '@vitejs/plugin-basic-ssl'; // <-- 1. IMPORTA EL PLUGIN SSL

export default defineConfig({
  // --- PLUGINS ---
  // Añadimos el plugin de SSL a tu lista de plugins existentes.
  plugins: [
    react(),
    basicSsl() // <-- 2. AÑADE EL PLUGIN SSL
  ],

  // --- CONFIGURACIÓN DEL SERVIDOR ---
  server: {
    // 3. AÑADE LA CONFIGURACIÓN PARA HTTPS
    https: true, // Esto le dice a Vite que use HTTPS. `basicSsl()` se encargará de los certificados.
    
    // 4. ASEGÚRATE DE QUE EL SERVIDOR SEA ACCESIBLE EN TU RED
    host: true,  // Esto hace que el servidor escuche en todas las interfaces de red (no solo localhost).
    
    // 5. MANTENEMOS TU PROXY (aunque necesitará un ajuste para funcionar con la IP)
    // El proxy es útil cuando pruebas en el navegador de tu PC, pero no funcionará
    // directamente cuando accedas desde tu celular. Las llamadas a la API desde el celular
    // deberán usar la IP completa. Por ahora, lo dejamos como está.
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000", 
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // --- MANTENEMOS TUS OTRAS CONFIGURACIONES ---
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  publicDir: path.resolve(__dirname, "./public"),
});