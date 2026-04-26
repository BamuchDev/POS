import { useState, useEffect } from 'react'

function Reportes({ usuario }) {

  const [ventas, setVentas] = useState([])
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [resumen, setResumen] = useState(null)

  useEffect(function() {
    const hoy = new Date().toISOString().split("T")[0]
    setFechaInicio(hoy)
    setFechaFin(hoy)
    buscarPorFecha(hoy, hoy)
  }, [])

  function buscarPorFecha(inicio, fin) {
    fetch("http://localhost:3000/reportes/" + inicio + "/" + fin)
      .then(function(r) { return r.json() })
      .then(function(data) {
        setVentas(data.ventas)
        setResumen({
          totalVentas: data.totalVentas,
          totalDinero: data.totalDinero
        })
      })
  }

  function handleBuscar() {
    if (!fechaInicio || !fechaFin) {
      alert("Selecciona las dos fechas")
      return
    }
    buscarPorFecha(fechaInicio, fechaFin)
  }

  function cancelarVenta(id) {
    if (!confirm("¿Seguro que quieres cancelar esta venta?")) return

    fetch("http://localhost:3000/ventas/" + id, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: usuario.usuario })
    })
    .then(function(r) { return r.json() })
    .then(function() {
      buscarPorFecha(fechaInicio, fechaFin)
    })
  }

  function tituloPeriodo() {
    const hoy = new Date().toISOString().split("T")[0]
    if (!fechaInicio || !fechaFin) return "Ventas de hoy"
    if (fechaInicio === hoy && fechaFin === hoy) return "Ventas de hoy"
    if (fechaInicio === fechaFin) {
      return "Ventas del " + new Date(fechaInicio + "T12:00:00").toLocaleDateString("es-MX")
    }
    return "Ventas del " + new Date(fechaInicio + "T12:00:00").toLocaleDateString("es-MX") +
           " al " + new Date(fechaFin + "T12:00:00").toLocaleDateString("es-MX")
  }

  function imprimirReporte() {
    if (ventas.length === 0) {
      alert("No hay ventas para imprimir")
      return
    }

    const titulo = tituloPeriodo()
    const totalVentas = resumen ? resumen.totalVentas : 0
    const totalDinero = resumen ? resumen.totalDinero : 0
    const nombreUsuario = usuario ? usuario.nombre : "Admin"

    const filas = ventas.map(function(venta) {
      const fecha = new Date(venta.fecha)
      return `
        <tr>
          <td style="padding:5px; border-bottom:1px solid #eee">#${venta.id}</td>
          <td style="padding:5px; border-bottom:1px solid #eee">${fecha.toLocaleDateString("es-MX")}</td>
          <td style="padding:5px; border-bottom:1px solid #eee">${fecha.toLocaleTimeString("es-MX")}</td>
          <td style="padding:5px; border-bottom:1px solid #eee; text-align:right">$${venta.total}</td>
        </tr>
      `
    }).join("")

    const ventana = window.open("", "_blank", "width=800,height=600")
    ventana.document.write(`
      <html>
        <head><title>Reporte</title></head>
        <body style="font-family: monospace; padding: 20px;">
          <h2 style="text-align:center; margin:0">Farmacia Rocío</h2>
          <h3 style="text-align:center; margin:5px 0">Reporte de Ventas</h3>
          <p style="text-align:center; margin:5px 0">${titulo}</p>
          <hr/>
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:#2c3e50; color:white;">
                <th style="padding:8px; text-align:left">ID</th>
                <th style="padding:8px; text-align:left">Fecha</th>
                <th style="padding:8px; text-align:left">Hora</th>
                <th style="padding:8px; text-align:right">Total</th>
              </tr>
            </thead>
            <tbody>${filas}</tbody>
          </table>
          <hr/>
          <p><strong>Total ventas:</strong> ${totalVentas}</p>
          <p><strong>Total dinero:</strong> $${totalDinero}</p>
          <p style="margin-top:20px; font-size:12px; color:#666">
            Generado el ${new Date().toLocaleString("es-MX")} por ${nombreUsuario}
          </p>
          <script>window.print(); window.close();<\/script>
        </body>
      </html>
    `)
  }

  return (
    <div>
      <h2>Reportes de Ventas</h2>

      <div style={{
        background: "#f5f5f5", padding: "15px",
        borderRadius: "8px", marginBottom: "20px",
        display: "flex", gap: "10px", alignItems: "center"
      }}>
        <label>Desde:</label>
        <input
          type="date"
          value={fechaInicio}
          onChange={function(e) { setFechaInicio(e.target.value) }}
        />
        <label>Hasta:</label>
        <input
          type="date"
          value={fechaFin}
          onChange={function(e) { setFechaFin(e.target.value) }}
        />
        <button onClick={handleBuscar}>Buscar</button>
        <button
          onClick={imprimirReporte}
          style={{ background: "#27ae60", marginLeft: "auto" }}
        >
          🖨️ Imprimir reporte
        </button>
      </div>

      <h3 style={{ marginBottom: "15px", color: "#2c3e50" }}>
        {tituloPeriodo()}
      </h3>

      {resumen && (
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div style={{
            background: "#2c3e50", color: "white",
            padding: "20px", borderRadius: "8px", flex: 1
          }}>
            <h3>Total ventas</h3>
            <p style={{ fontSize: "28px", fontWeight: "bold" }}>
              {resumen.totalVentas}
            </p>
          </div>
          <div style={{
            background: "#27ae60", color: "white",
            padding: "20px", borderRadius: "8px", flex: 1
          }}>
            <h3>Total dinero</h3>
            <p style={{ fontSize: "28px", fontWeight: "bold" }}>
              ${resumen.totalDinero}
            </p>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Total</th>
            <th>Cancelar</th>
          </tr>
        </thead>
        <tbody>
          {ventas.length === 0
            ? <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                  No hay ventas en ese período
                </td>
              </tr>
            : ventas.map(function(venta) {
                const fecha = new Date(venta.fecha)
                return (
                  <tr key={venta.id}>
                    <td>#{venta.id}</td>
                    <td>{fecha.toLocaleDateString("es-MX")}</td>
                    <td>{fecha.toLocaleTimeString("es-MX")}</td>
                    <td>${venta.total}</td>
                    <td>
                      <button
                        style={{ background: "#e74c3c" }}
                        onClick={function() { cancelarVenta(venta.id) }}
                      >
                        Cancelar
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

export default Reportes