import { useState, useEffect } from 'react'

function Usuarios() {

  const [usuarios, setUsuarios] = useState([])
  const [nuevo, setNuevo] = useState({ nombre: "", usuario: "", password: "", rol: "empleado" })
  const [mensaje, setMensaje] = useState("")

  useEffect(function() {
    cargarUsuarios()
  }, [])

  function cargarUsuarios() {
    fetch("http://localhost:3000/usuarios")
      .then(function(r) { return r.json() })
      .then(function(data) { setUsuarios(data) })
  }

  function agregarUsuario() {
    if (!nuevo.nombre || !nuevo.usuario || !nuevo.password) {
      alert("Llena todos los campos")
      return
    }

    fetch("http://localhost:3000/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevo)
    })
    .then(function(r) { return r.json() })
    .then(function(data) {
      if (data.error) {
        alert(data.error)
        return
      }
      setMensaje("Usuario creado ✅")
      setNuevo({ nombre: "", usuario: "", password: "", rol: "empleado" })
      cargarUsuarios()
      setTimeout(function() { setMensaje("") }, 3000)
    })
  }

  function eliminarUsuario(id) {
    if (!confirm("¿Seguro que quieres eliminar este usuario?")) return

    fetch("http://localhost:3000/usuarios/" + id, {
      method: "DELETE"
    })
    .then(function(r) { return r.json() })
    .then(function() { cargarUsuarios() })
  }

  return (
    <div>
      <h2>Usuarios</h2>

      {/* formulario agregar */}
      <div style={{
        background: "#f5f5f5", padding: "15px",
        borderRadius: "8px", marginBottom: "20px"
      }}>
        <h3 style={{ marginBottom: "10px" }}>Agregar usuario</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            placeholder="Nombre completo"
            value={nuevo.nombre}
            style={{ flex: 1 }}
            onChange={function(e) { setNuevo({ ...nuevo, nombre: e.target.value }) }}
          />
          <input
            placeholder="Usuario"
            value={nuevo.usuario}
            style={{ width: "130px" }}
            onChange={function(e) { setNuevo({ ...nuevo, usuario: e.target.value }) }}
          />
          <input
            placeholder="Contraseña"
            type="password"
            value={nuevo.password}
            style={{ width: "130px" }}
            onChange={function(e) { setNuevo({ ...nuevo, password: e.target.value }) }}
          />
          <select
            value={nuevo.rol}
            style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ddd" }}
            onChange={function(e) { setNuevo({ ...nuevo, rol: e.target.value }) }}
          >
            <option value="empleado">Empleado</option>
            <option value="admin">Administrador</option>
          </select>
          <button onClick={agregarUsuario}>Agregar</button>
        </div>
        {mensaje && (
          <p style={{ marginTop: "10px", color: "green", fontWeight: "bold" }}>{mensaje}</p>
        )}
      </div>

      {/* tabla de usuarios */}
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(function(u) {
            return (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.usuario}</td>
                <td>
                  <span style={{
                    background: u.rol === "admin" ? "#2c3e50" : "#3498db",
                    color: "white",
                    padding: "3px 8px",
                    borderRadius: "3px",
                    fontSize: "12px"
                  }}>
                    {u.rol === "admin" ? "Administrador" : "Empleado"}
                  </span>
                </td>
                <td>
                  <button
                    style={{ background: "#e74c3c" }}
                    onClick={function() { eliminarUsuario(u.id) }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Usuarios