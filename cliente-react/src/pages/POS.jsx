import { useState, useEffect } from 'react'
import Carrito from '../components/Carrito'

function POS({ usuario }) {

  const [carrito, setCarrito] = useState([])
  const [modalNuevo, setModalNuevo] = useState(null)
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: "", precio: "" })

  useEffect(function() {
    const campo = document.getElementById("campoBusqueda")
    if (!campo) return

    function handleKeyDown(evento) {
      if (evento.key === "Enter") buscarYAgregar()
    }

    campo.addEventListener("keydown", handleKeyDown)
    return function() { campo.removeEventListener("keydown", handleKeyDown) }
  }, [carrito])

  function buscarYAgregar() {
    const campo = document.getElementById("campoBusqueda")
    const codigo = campo.value.trim()
    if (!codigo) return

    fetch("http://localhost:3000/productos/buscar/" + codigo)
      .then(function(r) { return r.json() })
      .then(function(data) {
        if (data.existe) {
          agregarAlCarrito(data.producto)
          campo.value = ""
          campo.focus()
        } else {
          setModalNuevo(codigo)
          setNuevoProducto({ nombre: "", precio: "" })
          campo.value = ""
        }
      })
  }

  function agregarAlCarrito(producto) {
    const productoEnCarrito = carrito.find(function(p) {
      return p.codigo === producto.codigo
    })

    if (productoEnCarrito !== undefined) {
      setCarrito(carrito.map(function(p) {
        if (p.codigo === producto.codigo) {
          return { ...p, cantidad: p.cantidad + 1 }
        }
        return p
      }))
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }])
    }
  }

  function guardarNuevoProducto() {
    if (!nuevoProducto.nombre || !nuevoProducto.precio) {
      alert("Llena nombre y precio")
      return
    }

    fetch("http://localhost:3000/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo: modalNuevo,
        nombre: nuevoProducto.nombre,
        precio: Number(nuevoProducto.precio),
        usuario: usuario.usuario
      })
    })
    .then(function(r) { return r.json() })
    .then(function(datos) {
      agregarAlCarrito({
        id: datos.id,
        codigo: modalNuevo,
        nombre: nuevoProducto.nombre,
        precio: Number(nuevoProducto.precio),
        gramaje: "",
        laboratorio: "",
        stock: 0
      })
      setModalNuevo(null)
      document.getElementById("campoBusqueda").focus()
    })
  }

  function eliminarProducto(codigo) {
    const productoEnCarrito = carrito.find(function(p) { return p.codigo === codigo })

    if (productoEnCarrito.cantidad > 1) {
      setCarrito(carrito.map(function(p) {
        if (p.codigo === codigo) return { ...p, cantidad: p.cantidad - 1 }
        return p
      }))
    } else {
      setCarrito(carrito.filter(function(p) { return p.codigo !== codigo }))
    }
  }

  function cobrarEImprimir() {
    if (carrito.length === 0) {
      alert("El carrito está vacío")
      return
    }

    fetch("http://localhost:3000/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        total: total,
        productos: carrito,
        usuario: usuario.usuario
      })
    })
    .then(function(r) { return r.json() })
    .then(function() {
      const ventana = window.open("", "_blank", "width=400,height=600")
      ventana.document.write(`
        <html>
          <head><title>Ticket</title></head>
          <body style="font-family: monospace; padding: 20px; max-width: 300px;">
            <h2 style="text-align:center; margin:0">Farmacia Rocío</h2>
            <p style="text-align:center; margin:5px 0">Tel: 771-123-4567</p>
            <p style="text-align:center; margin:5px 0">Atendió: ${usuario.nombre}</p>
            <hr/>
            ${carrito.map(function(p) {
              return `
                <p style="margin:8px 0">
                  ${p.nombre} ${p.gramaje || ""} — $${p.precio * p.cantidad}
                </p>
              `
            }).join("")}
            <hr/>
            <h3 style="text-align:right">TOTAL: $${total}</h3>
            <p style="text-align:center">¡Gracias por su compra!</p>
            <script>window.print(); window.close();<\/script>
          </body>
        </html>
      `)

      setCarrito([])
      document.getElementById("campoBusqueda").focus()
    })
    .catch(function(error) {
      console.log("Error:", error)
    })
  }

  const total = carrito.reduce(function(suma, producto) {
    return suma + (producto.precio * producto.cantidad)
  }, 0)

  return (
    <div>
      <h2>Punto de Venta</h2>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          id="campoBusqueda"
          type="text"
          placeholder="Escanea o escribe el código de barras..."
          style={{ flex: 1 }}
          autoFocus
        />
        <button onClick={buscarYAgregar}>Agregar</button>
      </div>

      <Carrito carrito={carrito} onEliminar={eliminarProducto} />

      <div style={{
        marginTop: "20px", padding: "15px",
        background: "#f5f5f5", borderRadius: "8px",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <h3 style={{ margin: 0 }}>Total: ${total}</h3>
        <button
          onClick={cobrarEImprimir}
          style={{ background: "#27ae60", fontSize: "16px", padding: "10px 20px" }}
        >
          Cobrar e imprimir ticket
        </button>
      </div>

      {modalNuevo && (
        <div style={{
          position: "fixed", top: 0, left: 0,
          width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)",
          display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{
            background: "white", padding: "30px",
            borderRadius: "10px", width: "400px"
          }}>
            <h3>Producto nuevo</h3>
            <p style={{ color: "#666", marginBottom: "15px" }}>
              Código: <strong>{modalNuevo}</strong>
            </p>

            <input
              placeholder="Nombre del producto"
              value={nuevoProducto.nombre}
              autoFocus
              style={{ width: "100%", marginBottom: "10px", display: "block" }}
              onChange={function(e) {
                setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })
              }}
              onKeyDown={function(e) { if (e.key === "Enter") guardarNuevoProducto() }}
            />

            <input
              placeholder="Precio"
              type="number"
              value={nuevoProducto.precio}
              style={{ width: "100%", marginBottom: "15px", display: "block" }}
              onChange={function(e) {
                setNuevoProducto({ ...nuevoProducto, precio: e.target.value })
              }}
              onKeyDown={function(e) { if (e.key === "Enter") guardarNuevoProducto() }}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                style={{ background: "#27ae60", flex: 1 }}
                onClick={guardarNuevoProducto}
              >
                Guardar y agregar
              </button>
              <button
                style={{ background: "#e74c3c", flex: 1 }}
                onClick={function() { setModalNuevo(null) }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default POS