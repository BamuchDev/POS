import { useState, useEffect } from 'react'

function Productos() {

  const [productos, setProductos] = useState([])
  const [nuevo, setNuevo] = useState({ codigo: "", nombre: "", gramaje: "", laboratorio: "", precio: "" })
  const [editando, setEditando] = useState(null)
  const [mensaje, setMensaje] = useState("")

  useEffect(function() {
    cargarProductos()
  }, [])

  function cargarProductos() {
    fetch("http://localhost:3000/productos")
      .then(function(r) { return r.json() })
      .then(function(data) { setProductos(data) })
  }

  function agregarProducto() {
    if (!nuevo.codigo || !nuevo.nombre || !nuevo.precio) {
      alert("Código, nombre y precio son obligatorios")
      return
    }

    fetch("http://localhost:3000/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevo)
    })
    .then(function(r) { return r.json() })
    .then(function() {
      setNuevo({ codigo: "", nombre: "", gramaje: "", laboratorio: "", precio: "" })
      cargarProductos()
    })
  }

  function eliminarProducto(id) {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return
    fetch("http://localhost:3000/productos/" + id, { method: "DELETE" })
      .then(function(r) { return r.json() })
      .then(function() { cargarProductos() })
  }

  function guardarEdicion() {
    fetch("http://localhost:3000/productos/" + editando.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: editando.nombre,
        gramaje: editando.gramaje,
        laboratorio: editando.laboratorio,
        precio: editando.precio
      })
    })
    .then(function(r) { return r.json() })
    .then(function() {
      setEditando(null)
      cargarProductos()
    })
  }

  function importarExcel(evento) {
    const archivo = evento.target.files[0]
    if (!archivo) return

    const formData = new FormData()
    formData.append("archivo", archivo)

    fetch("http://localhost:3000/productos/importar", {
      method: "POST",
      body: formData
    })
    .then(function(r) { return r.json() })
    .then(function(datos) {
      setMensaje(`✅ ${datos.insertados} productos importados, ${datos.ignorados} ignorados`)
      cargarProductos()
      evento.target.value = ""
    })
  }

  return (
    <div>
      <h2>Productos</h2>

      {/* importar desde Excel */}
      <div style={{
        background: "#f5f5f5", padding: "15px",
        borderRadius: "8px", marginBottom: "20px"
      }}>
        <p style={{ marginBottom: "8px", fontWeight: "bold" }}>
          Importar desde Excel o CSV
        </p>
        <p style={{ marginBottom: "10px", fontSize: "13px", color: "#666" }}>
          Columnas requeridas: codigo, nombre, gramaje, laboratorio, precio, stock
        </p>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={importarExcel} />
        {mensaje && (
          <p style={{ marginTop: "10px", color: "green", fontWeight: "bold" }}>{mensaje}</p>
        )}
      </div>

      {/* formulario agregar */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          placeholder="Código"
          value={nuevo.codigo}
          style={{ width: "120px" }}
          onChange={function(e) { setNuevo({ ...nuevo, codigo: e.target.value }) }}
        />
        <input
        placeholder="Nombre"
        value={nuevo.nombre}
        style={{ width: "150px" }}
        onChange={function(e) { setNuevo({ ...nuevo, nombre: e.target.value }) }}
        />
        <input
          placeholder="Gramaje"
          value={nuevo.gramaje}
          style={{ width: "100px" }}
          onChange={function(e) { setNuevo({ ...nuevo, gramaje: e.target.value }) }}
        />
        <input
          placeholder="Laboratorio"
          value={nuevo.laboratorio}
          style={{ width: "130px" }}
          onChange={function(e) { setNuevo({ ...nuevo, laboratorio: e.target.value }) }}
        />
        <input
          placeholder="Precio"
          type="number"
          value={nuevo.precio}
          style={{ width: "100px" }}
          onChange={function(e) { setNuevo({ ...nuevo, precio: e.target.value }) }}
        />
        <button onClick={agregarProducto}>Agregar</button>
      </div>

      {/* tabla */}
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Gramaje</th>
            <th>Laboratorio</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(function(producto) {
            const estaEditando = editando && editando.id === producto.id
            return (
              <tr key={producto.id}>
                <td>{producto.codigo}</td>
                <td>
                  {estaEditando
                    ? <input value={editando.nombre}
                        onChange={function(e) { setEditando({ ...editando, nombre: e.target.value }) }} />
                    : producto.nombre
                  }
                </td>
                <td>
                  {estaEditando
                    ? <input value={editando.gramaje} style={{ width: "80px" }}
                        onChange={function(e) { setEditando({ ...editando, gramaje: e.target.value }) }} />
                    : producto.gramaje || "—"
                  }
                </td>
                <td>
                  {estaEditando
                    ? <input value={editando.laboratorio} style={{ width: "100px" }}
                        onChange={function(e) { setEditando({ ...editando, laboratorio: e.target.value }) }} />
                    : producto.laboratorio || "—"
                  }
                </td>
                <td>
                  {estaEditando
                    ? <input type="number" value={editando.precio} style={{ width: "80px" }}
                        onChange={function(e) { setEditando({ ...editando, precio: e.target.value }) }} />
                    : "$" + producto.precio
                  }
                </td>
                <td>{producto.stock}</td>
                <td>
                  {estaEditando
                    ? <>
                        <button onClick={guardarEdicion}>Guardar</button>
                        <button style={{ marginLeft: "5px", background: "#e74c3c" }}
                          onClick={function() { setEditando(null) }}>Cancelar</button>
                      </>
                    : <>
                        <button onClick={function() { setEditando(producto) }}>Editar</button>
                        <button style={{ marginLeft: "5px", background: "#e74c3c" }}
                          onClick={function() { eliminarProducto(producto.id) }}>Eliminar</button>
                      </>
                  }
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Productos