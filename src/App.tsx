import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import InstitutionRegisterPage from "./pages/InstitutionRegisterPage"
import AdminPanel from "./pages/AdminPanel"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/registro-institucion" element={<InstitutionRegisterPage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  )
}

export default App

