import { useState, useEffect } from 'react'

function Caja({ usuario }) {

  const [caja, setCaja] = useState(null)
  const [fondoInicial, setFondoInicial] = useState(500)
  const [cortado, setCortado] = useState(false)
  const [detalles, setDetalles] = useState({})
  // detalles → objeto que guarda los productos de cada venta

  useEffect(function() {
    cargarCaja()
  }, [])

  function cargarCaja() {
    fetch("http://localhost:3000/caja")
      .then(function(r) { return r.json() })
      .then(function(data) {
        setCaja(data)
        // cargar detalles de cada venta
        data.ventas.forEach(function(venta) {
          cargarDetalle(venta.id)
        })
      })
  }

  function cargarDetalle(ventaId) {
    fetch("http://localhost:3000/ventas/" + ventaId + "/detalle")
      .then(function(r) { return r.json() })
      .then(function(data) {
        setDetalles(function(prev) {
          return { ...prev, [ventaId]: data }
        })
      })
  }

  function hacerCorte() {
    if (!confirm("¿Seguro que quieres hacer el corte de caja?")) return
    setCortado(true)
  }

  const totalEsperado = fondoInicial + (caja ? caja.totalVentas : 0)

  return (
    <div>
      <h2>Corte de Caja</h2>

      {cortado && (
        <div style={{
          background: "#27ae60", color: "white",
          padding: "15px", borderRadius: "8px",
          marginBottom: "20px", fontWeight: "bold"
        }}>
          ✅ Corte realizado correctamente para el {new Date().toLocaleDateString("es-MX")}
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <label>Fondo inicial del día: $</label>
        <input
          type="number"
          value={fondoInicial}
          onChange={function(e) { setFondoInicial(Number(e.target.value)) }}
          style={{ width: "100px" }}
        />
      </div>

      {caja && (
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div style={{
            background: "#2c3e50", color: "white",
            padding: "20px", borderRadius: "8px", flex: 1
          }}>
            <h3>Fondo inicial</h3>
            <p style={{ fontSize: "24px" }}>${fondoInicial}</p>
          </div>
          <div style={{
            background: "#3498db", color: "white",
            padding: "20px", borderRadius: "8px", flex: 1
          }}>
            <h3>Ventas del día</h3>
            <p style={{ fontSize: "24px" }}>{caja.numeroVentas} ventas</p>
            <p style={{ fontSize: "20px" }}>${caja.totalVentas}</p>
          </div>
          <div style={{
            background: "#27ae60", color: "white",
            padding: "20px", borderRadius: "8px", flex: 1
          }}>
            <h3>Total en caja</h3>
            <p style={{ fontSize: "24px" }}>${totalEsperado}</p>
          </div>
        </div>
      )}

      {/* tabla de ventas con detalle */}
      {caja && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Hora</th>
              <th>Productos</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {caja.ventas.length === 0
              ? <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                    No hay ventas hoy
                  </td>
                </tr>
              : caja.ventas.map(function(venta) {
                  const hora = new Date(venta.fecha).toLocaleTimeString("es-MX")
                  const productos = detalles[venta.id] || []
                  return (
                    <tr key={venta.id}>
                      <td>#{venta.id}</td>
                      <td>{hora}</td>
                      <td>
                        {productos.length === 0
                          ? "Cargando..."
                          : productos.map(function(p) {
                              return (
                                <div key={p.id} style={{ fontSize: "13px", marginBottom: "3px" }}>
                                  {p.nombre} {p.gramaje || ""} x{p.cantidad} — ${p.subtotal}
                                </div>
                              )
                            })
                        }
                      </td>
                      <td style={{ fontWeight: "bold" }}>${venta.total}</td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
      )}

      {/* botón corte disponible para todos */}
      {!cortado && (
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={hacerCorte}
            style={{
              background: "#e74c3c",
              padding: "12px 24px",
              fontSize: "16px"
            }}
          >
            Hacer corte de caja
          </button>
        </div>
      )}
    </div>
  )
}

export default Caja