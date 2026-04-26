import { useState, useEffect } from 'react'

function Inventario() {

  const [productos, setProductos] = useState([])
  const [cantidades, setCantidades] = useState({})
  const [busqueda, setBusqueda] = useState("")

  const STOCK_MINIMO = 10

  useEffect(function() {
    cargarInventario()
  }, [])

  function cargarInventario() {
    fetch("http://localhost:3000/inventario")
      .then(function(r) { return r.json() })
      .then(function(data) { setProductos(data) })
  }

  function actualizarStock(id, nuevoStock) {
    if (nuevoStock < 0) {
      alert("El stock no puede ser negativo")
      return
    }

    fetch("http://localhost:3000/inventario/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: nuevoStock })
    })
    .then(function(r) { return r.json() })
    .then(function() { cargarInventario() })
  }

  // filtrar productos según la búsqueda
  const productosFiltrados = productos.filter(function(p) {
    const texto = busqueda.toLowerCase()
    return (
      p.nombre.toLowerCase().includes(texto) ||
      p.codigo.toLowerCase().includes(texto)
    )
  })

  const productosAgotados = productos.filter(function(p) {
    return p.stock === 0
  })

  const productosBajos = productos.filter(function(p) {
    return p.stock > 0 && p.stock < STOCK_MINIMO
  })

  return (
    <div>
      <h2>Inventario</h2>

      {productosAgotados.length > 0 && (
        <div style={{
          background: "#e74c3c", color: "white",
          padding: "10px 15px", borderRadius: "5px",
          marginBottom: "10px"
        }}>
          ⚠️ {productosAgotados.length} producto(s) agotado(s):
          {productosAgotados.map(function(p) {
            return <strong key={p.id}> {p.nombre}</strong>
          })}
        </div>
      )}

      {productosBajos.length > 0 && (
        <div style={{
          background: "#f39c12", color: "white",
          padding: "10px 15px", borderRadius: "5px",
          marginBottom: "15px"
        }}>
          ⚡ {productosBajos.length} producto(s) con stock bajo:
          {productosBajos.map(function(p) {
            return <strong key={p.id}> {p.nombre} ({p.stock})</strong>
          })}
        </div>
      )}

      {/* buscador */}
      <div style={{ marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={busqueda}
          onChange={function(e) { setBusqueda(e.target.value) }}
          style={{ width: "300px" }}
        />
        {busqueda && (
          <button
            style={{ marginLeft: "10px", background: "#95a5a6" }}
            onClick={function() { setBusqueda("") }}
          >
            Limpiar
          </button>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Stock actual</th>
            <th>Estado</th>
            <th>Cantidad</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {productosFiltrados.length === 0
            ? <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                  No se encontraron productos
                </td>
              </tr>
            : productosFiltrados.map(function(producto) {

                let estado = "✅ OK"
                let color = "green"
                if (producto.stock === 0) {
                  estado = "❌ Agotado"
                  color = "red"
                } else if (producto.stock < STOCK_MINIMO) {
                  estado = "⚡ Bajo"
                  color = "orange"
                }

                return (
                  <tr key={producto.id}>
                    <td>{producto.codigo}</td>
                    <td>{producto.nombre}</td>
                    <td style={{ fontWeight: "bold" }}>{producto.stock}</td>
                    <td style={{ color: color, fontWeight: "bold" }}>{estado}</td>
                    <td>
                      <input
                        type="number"
                        placeholder="Cantidad"
                        style={{ width: "80px" }}
                        value={cantidades[producto.id] || ""}
                        onChange={function(e) {
                          setCantidades({ ...cantidades, [producto.id]: Number(e.target.value) })
                        }}
                      />
                    </td>
                    <td style={{ display: "flex", gap: "5px" }}>
                      <button
                        style={{ background: "#27ae60" }}
                        onClick={function() {
                          const cantidad = cantidades[producto.id] || 0
                          if (cantidad === 0) {
                            alert("Escribe una cantidad")
                            return
                          }
                          actualizarStock(producto.id, producto.stock + cantidad)
                        }}
                      >
                        + Agregar
                      </button>
                      <button
                        style={{ background: "#e74c3c" }}
                        onClick={function() {
                          const cantidad = cantidades[producto.id] || 0
                          if (cantidad === 0) {
                            alert("Escribe una cantidad")
                            return
                          }
                          actualizarStock(producto.id, producto.stock - cantidad)
                        }}
                      >
                        - Restar
                      </button>
                    </td>
                  </tr>
                )
              })
          }
        </tbody>
      </table>
    </div>
  )
}

export default Inventario