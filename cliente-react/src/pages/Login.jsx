import { useState, useEffect } from 'react'

function Login({ onLogin }) {

  const [usuario, setUsuario] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  // limpiar la URL al mostrar el login
  useEffect(function() {
    window.history.replaceState({}, "", "/")
  }, [])

  function handleLogin() {
    if (!usuario || !password) {
      setError("Llena todos los campos")
      return
    }

    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, password })
    })
    .then(function(r) { return r.json() })
    .then(function(data) {
      if (data.ok) {
        onLogin(data.usuario)
      } else {
        setError(data.mensaje)
      }
    })
  }

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#f5f5f5"
    }}>
      <div style={{
        background: "white",
        padding: "40px",
        borderRadius: "10px",
        width: "350px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{
          textAlign: "center",
          color: "#2c3e50",
          marginBottom: "5px"
        }}>
          Farmacia Rocío
        </h2>
        <p style={{
          textAlign: "center",
          color: "#666",
          marginBottom: "25px"
        }}>
          Sistema de Punto de Venta
        </p>

        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          style={{ width: "100%", marginBottom: "10px", display: "block" }}
          onChange={function(e) { setUsuario(e.target.value) }}
          onKeyDown={function(e) { if (e.key === "Enter") handleLogin() }}
          autoFocus
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          style={{ width: "100%", marginBottom: "15px", display: "block" }}
          onChange={function(e) { setPassword(e.target.value) }}
          onKeyDown={function(e) { if (e.key === "Enter") handleLogin() }}
        />

        {error && (
          <p style={{ color: "red", marginBottom: "10px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          style={{ width: "100%", padding: "10px", fontSize: "16px" }}
        >
          Entrar
        </button>
      </div>
    </div>
  )
}

export default Login