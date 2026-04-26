function Carrito({ carrito, onEliminar }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Gramaje</th>
          <th>Laboratorio</th>
          <th>Precio</th>
          <th>Cantidad</th>
          <th>Subtotal</th>
          <th>Eliminar</th>
        </tr>
      </thead>
      <tbody>
        {carrito.length === 0
          ? <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                Sin productos
              </td>
            </tr>
          : carrito.map(function(producto) {
              const subtotal = producto.precio * producto.cantidad
              return (
                <tr key={producto.codigo}>
                  <td>{producto.nombre}</td>
                  <td>{producto.gramaje || "—"}</td>
                  <td>{producto.laboratorio || "—"}</td>
                  <td>${producto.precio}</td>
                  <td>{producto.cantidad}</td>
                  <td>${subtotal}</td>
                  <td>
                    <button
                      style={{ background: "#e74c3c" }}
                      onClick={function() { onEliminar(producto.codigo) }}
                    >
                      X
                    </button>
                  </td>
                </tr>
              )
            })
        }
      </tbody>
    </table>
  )
}

export default Carrito