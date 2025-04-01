import type React from "react";
import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google"; // Importa la fuente desde Google Fonts
import "../globals.css";

// Configura la fuente Nunito Sans
const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["200", "400", "600", "800", "1000"], // Define los pesos que necesitas
  style: ["normal", "italic"], // Define los estilos que necesitas
});

export const metadata: Metadata = {
  title: "Panel de Administración - Uguee",
  description: "Panel de administración para la plataforma de transporte Uguee",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={nunitoSans.variable}>{children}</body>
    </html>
  );
}