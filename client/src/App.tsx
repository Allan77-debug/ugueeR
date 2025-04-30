import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import InstitutionRegisterPage from "./pages/InstitutionRegisterPage"
import AdminPanel from "./pages/AdminPanel"
import Login from "./pages/LoginPage"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/registro-institucion" element={<InstitutionRegisterPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App

