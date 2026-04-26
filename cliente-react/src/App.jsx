import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import POS from './pages/POS'
import Productos from './pages/Productos'
import Inventario from './pages/Inventario'
import Caja from './pages/Caja'
import Reportes from './pages/Reportes'
import Usuarios from './pages/Usuarios'
import './App.css'

function App() {

  const [usuarioActivo, setUsuarioActivo] = useState(null)

  function handleLogin(usuario) {
    setUsuarioActivo(usuario)
  }

  function handleLogout() {
    setUsuarioActivo(null)
  }

  if (!usuarioActivo) {
    return <Login onLogin={handleLogin} />
  }

  const esAdmin = usuarioActivo.rol === "admin"

  return (
    <BrowserRouter>
      <nav>
        <Link to="/">🏠</Link>
        {esAdmin && <Link to="/productos">Productos</Link>}
        {esAdmin && <Link to="/inventario">Inventario</Link>}
        <Link to="/caja">Caja</Link>
        {esAdmin && <Link to="/reportes">Reportes</Link>}
        {esAdmin && <Link to="/usuarios">Usuarios</Link>}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "white", fontSize: "14px" }}>
            {usuarioActivo.nombre} ({usuarioActivo.rol})
          </span>
          <button
            onClick={handleLogout}
            style={{ background: "#e74c3c", padding: "5px 12px", fontSize: "13px" }}
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div id="contenido">
        <Routes>
          <Route path="/" element={<POS usuario={usuarioActivo} />} />
          <Route path="/productos" element={
            esAdmin ? <Productos /> : <Navigate to="/" />
          } />
          <Route path="/inventario" element={
            esAdmin ? <Inventario /> : <Navigate to="/" />
          } />
          <Route path="/caja" element={<Caja usuario={usuarioActivo} />} />
          <Route path="/reportes" element={
            esAdmin ? <Reportes usuario={usuarioActivo} /> : <Navigate to="/" />
          } />
          <Route path="/usuarios" element={
            esAdmin ? <Usuarios /> : <Navigate to="/" />
          } />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App