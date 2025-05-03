import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import InstitutionRegisterPage from "./pages/InstitutionRegisterPage"
import AdminPanel from "./pages/AdminPanel"
import Login from "./pages/LoginPage"
import LoginAdmin from "./pages/LoginAdmin"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/registro-institucion" element={<InstitutionRegisterPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login-admin" element={<LoginAdmin />} />
      </Routes>
    </Router>
  )
}

export default App

